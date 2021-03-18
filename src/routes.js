import Router from '@koa/router';
import {config} from "./config.js"
import {ldap} from "./ldapInit.js"
import {createUser,getUsers,groupUtils} from "./dataManagment.js"

export const router = new Router({prefix: config.prefix });

router.get('/users',async (ctx, next)=>{
    try{
        var data = await getUsers(ldap);
        ctx.body = data;
    }
    catch(e){
        ctx.status = 500;
    }
});

router.get('/groups',async (ctx, next)=>{
    try{
        await ldap.Connect();
        var data = await ldap.Search("(objectClass=groupOfNames)",config.groups_scope);
        ctx.body = data;
    }
    catch(e){
        ctx.status = 500;
    }
    finally{
        ldap.Disconnect();
    }
});

router.post('/groups/delete_member',async (ctx, next)=>{
    var success = false;
    var data = ctx.request.body
    try{
        var g = new groupUtils(ldap);
        var success = await g.removeGroupMember(data.dn_group, data.dn_user);
    }
    catch(e){
        success = false;
    }

    if(success === true) ctx.status = 200;
    else ctx.status = 500;

});

router.post('/groups/add_member',async (ctx, next)=>{
    var success = false;
    var data = ctx.request.body
    try{
        var g = new groupUtils(ldap);
        var success = await g.addGroupMember(data.dn_group, data.dn_user);
    }
    catch(e){
        console.log(e.message);
        success = false;
    }

    if(success === true) ctx.status = 200;
    else ctx.status = 500;
});

router.post('/create', async(ctx)=>{
    var data = ctx.request.body;
    var new_user = createUser(data);
    var scope = config.users_scope;
    var base_dn = (scope === "") ? config.base : `${scope},${config.base}`

    if(new_user === null) { ctx.status = 405; return;}
    var full_dn = `uid=${new_user.uid},`+base_dn;

    try{
        await ldap.Connect();
        await ldap.Add(full_dn, new_user);
        ctx.status = 200;
    }
    catch(e)
    {
        ctx.status = 405;
        ctx.body = e.message;
    }
    finally{
        ldap.Disconnect();
    }
});

router.post('/update', async(ctx)=>{
    var data = ctx.request.body;
    try{
        var dn = data.dn;
        await ldap.Connect();
        for( const [key, value] of Object.entries(data.updates)){
            var change = {  operation: 'replace',  modification: {[key]:value} }
            await ldap.Modify(dn, change);
        }
        
        ctx.status = 200;
    }
    catch(e)
    {
        ctx.status = 405;
        ctx.body = e.message;
    }
    finally{
        ldap.Disconnect();
    }
});

router.post('/delete', async(ctx)=>{
    var data = ctx.request.body;
    try{
        var dn = data.dn_user;
        await ldap.Connect();
        await ldap.Delete(dn);
        ctx.status = 200;
    }
    catch(e)
    {
        ctx.status = 405;
        ctx.body = e.message;
    }
    finally{
        ldap.Disconnect();
    }
});

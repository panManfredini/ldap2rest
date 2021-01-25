import Router from '@koa/router';
import {config} from "./config.js"
import {ldap} from "./ldapInit.js"

export const router = new Router({prefix: config.prefix });

router.get('/users',async (ctx, next)=>{
    try{
        await ldap.Connect();
        var data = await ldap.Search("(objectClass=inetOrgPerson)",config.users_scope);
        ctx.body = data;
    }
    catch(e){
        ctx.status = 500;
    }
    finally{
        ldap.Disconnect();
    }
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
    /*var data = ctx.request.body;
    var new_user = createUser(data);
    var scope = config.users_scope;
    var base_dn = (scope === "") ? this.baseDN : `${scope},${this.baseDN}`

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
    }*/
});

function createUser(data)
{
    if(!validateDataCreate(data)) return null;
    return {
        uid : data.user_name,
        objectclass: "inetOrgPerson",
        cn: data.full_name,
        sn: " ",
        mail: data.email,
        mobile: data.phone,
        displayname: data.display_name,
        userPassword: data.password
    }
}
function validateDataCreate(data)
{
    if(typeof data === "undefined")  return false;
    if( isEmptyString(data.user_name) ) return false;
    if( isEmptyString(data.password) ) return false;
    if( isEmptyString(data.phone) ) return false;
    if( isEmptyString(data.email) ) return false;
    if( isEmptyString(data.full_name) ) return false;
    if( isEmptyString(data.display_name) ) return false;
    return true;
}

function isEmptyString(str)
{
    if(typeof str !== "string" && str =="") return true;
    return false;
}
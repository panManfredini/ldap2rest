export function createUser(data) {
    if (!validateDataUserCreate(data)) return null;
    return {
        uid: data.uid,
        objectclass: "inetOrgPerson",
        cn: data.uid,
        sn: " ",
        mail: data.mail,
        mobile: data.mobile,
        displayname: data.displayName,
        userPassword: "test"
    }
}

function validateDataUserCreate(data) {
    if (typeof data === "undefined") return false;
    if (isEmptyString(data.uid)) return false;
    if (isEmptyString(data.mobile)) return false;
    if (isEmptyString(data.mail)) return false;
    if (isEmptyString(data.displayName)) return false;
    return true;
}

function isEmptyString(str) {
    if (typeof str !== "string" && str == "") return true;
    return false;
}

export async function getUsers(ldap)
{
    var data = {entries:[], success:false, error:"bad connection"};
    try{
        await ldap.Connect();
        data = await ldap.Search("(objectClass=inetOrgPerson)");
        ldap.Disconnect();

        var utils = new groupUtils(ldap);
        for(let i=0; i < data.entries.length; i++){
            var v = data.entries[i];
            try{
                v.userPassword = null;
                var _group = await utils.getGroupOfUser(v.dn);
                v.group = _group.entries[0];
            }
            catch(e)
            {
                v.group = null;
            }
        }
    }
    catch(e){
        console.log(e.message)
        data.success = false;
        data.error = e.message;
    }
    finally{
        ldap.Disconnect();
    }
    
    return data;
}

export class groupUtils {
    constructor(_ldap) {
        this.ldap = _ldap;
    }

    async getGroupOfUser(dn_user)
    {
        var data   = {entries:[], success:false, error:"bad connection"};
        try {
            await this.ldap.Connect();
            data = await this.ldap.Search(`(&(objectClass=groupOfNames)(member=${dn_user}))`);
        }
        catch (e) {
            console.error(e.message);
            data.success = false;
            data.error = e.message;
        }
        finally {
            this.ldap.Disconnect()
        }
        return data;
    }

    async addGroupMember(dn_group, dn_user) {
        var change = { operation: 'add', modification: { member: dn_user } }
        return await this.modifyGroupMember(dn_group, change);
    }

    async removeGroupMember(dn_group, dn_user) {
        var change = { operation: 'delete', modification: { member: dn_user } }
        return await this.modifyGroupMember(dn_group, change);
    }


    async modifyGroupMember(group, change) {
        var success = false;
        try {
            await this.ldap.Connect();
            var data = await this.ldap.Search(`(&(objectClass=groupOfNames)(dn=${group}))`);
            if (data.success === true) {
                await this.ldap.Modify(group, change);
                success = true;
            }
            else console.error(data.error);
        }
        catch (e) {
            console.error(e.message);
        }
        finally {
            this.ldap.Disconnect()
        }
        return success;
    }
}

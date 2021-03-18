export function createUser(data) {
    if (!validateDataUserCreate(data)) return null;
    return {
        uid: data.user_name,
        objectclass: "inetOrgPerson",
        cn: data.full_name,
        sn: " ",
        mail: data.email,
        mobile: data.phone,
        displayname: data.display_name,
        userPassword: data.password
    }
}

function validateDataUserCreate(data) {
    if (typeof data === "undefined") return false;
    if (isEmptyString(data.user_name)) return false;
    if (isEmptyString(data.password)) return false;
    if (isEmptyString(data.phone)) return false;
    if (isEmptyString(data.email)) return false;
    if (isEmptyString(data.full_name)) return false;
    if (isEmptyString(data.display_name)) return false;
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

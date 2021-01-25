import ldap from 'ldapjs';

/**
 * Little and very opionionated asyc wrapper to ldapjs. 
 * This is not supposed to leave the connection open but to destroy 
 * and reconnect each time.
 * Usage example:
 * ```js
 * var ldap = new ldapController(...)
 * try{
 *    await ldap.Connect();
 *    // do as many operation as you like here
 *    var data = await ldap.Search(...)
 *    // .....
 * }
 * catch(e){
 *   //do something on error
 * }
 * finally{
 *    ldap.Disconnect();
 * }
 * 
 * ```
 */
export class ldapController {
    
    constructor(url, baseDomain, adminDN, adminPW){
        this.ldapUrl = url;
        this.baseDN = baseDomain;
        this.adminDN = adminDN;
        this.adminPW = adminPW;
        this.client = undefined;
    }

    async Connect(){
        this.client =  ldap.createClient({
            url: [this.ldapUrl],
            timeout:2000,
            connectTimeout: 5000
        });
        await this._bind();
    }
    

    _bind(){
        return this._promisifyMethod( this.client.bind, this.adminDN, this.adminPW);
    }


    async Search(filterStr="(objectclass=*)"){
        var data = {entries:[], success:true, error:""};

        try{
            data = await this._asyncSearch(filterStr);
        }
        catch(err){
            data.success = false;
            data.error = err.message;
        }
        return data;
    }


    _asyncSearch(filterStr){
        var prom = new Promise((resolve, reject)=>{
        
            this.client.search(this.baseDN,{scope:"sub",filter:filterStr}, function(err, res) {
                var data = {entries:[], success:true, error:""};

                if(err) reject(err);

                res.on('error', function(err) {
                    reject(err);
                });

                res.on('searchEntry', function(entry) {
                    data.entries.push(entry.object);
                });

                res.on('end', function(result) {
                    data.success = (result.status === 0);
                    resolve(data);
                });
            });

        });
        return prom;
    }

    Modify(dn, change){
        const details = new ldap.Change(change);
        return this._promisifyMethod( this.client.modify, dn, details);
    }

    Add(dn, entry){
        return this._promisifyMethod( this.client.add, dn, entry);
    }

    Delete(dn){
        return this._promisifyMethod( this.client.del, dn);
    }

    Disconnect(){
        if(this.client) {
            this.client.unbind();
            this.client.destroy();
            this.client.removeAllListeners();
            this.client.connected = false;
        }
    }

    _promisifyMethod( method, ...args){
        
        var promise = new Promise( (resolve, reject)=>{
            
            const boundMethod = method.bind(this.client);
            boundMethod(...args, function(err) { 
                if(err) reject(err);
                else resolve();
            });
        
        });

        return promise;
    }
}
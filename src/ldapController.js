import ldap from 'ldapjs';

/**
 * Little and very opionionated asyc wrapper to ldapjs. 
 * This is not supposed to leave the connection open but to destroy 
 * and reconnect each time. 
 * IT IS NOT TO BE USED IN HIGH CONCURRENT ENVIROMENT (multiple requests at the same time)
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
        this._isBusy = Promise.resolve();
        this._resolveBusyState = undefined;
    }

    async Connect(){
        // this is just to avoid problems with multiple connections
        // basically it runs all query in series sincronously, it blocks.
        await this._isBusy;
        this._isBusy = new Promise(this._busyPromiseResolver.bind(this));

        this.client =  ldap.createClient({
            url: [this.ldapUrl],
            timeout:2000,
            connectTimeout: 5000
        });
        await this._bind();
    }

    _busyPromiseResolver(resolve)
    {
        this._resolveBusyState = resolve;
    }

    _bind(){
        return this._promisifyMethod( this.client.bind, this.adminDN, this.adminPW);
    }


    async Search(filterStr="(objectclass=*)", scope=""){
        var data   = {entries:[], success:true, error:""};
        var _scope = (scope === "") ? this.baseDN : `${scope},${this.baseDN}`;

        try{
            data = await this._asyncSearch(filterStr, _scope);
        }
        catch(err){
            data.success = false;
            data.error = err.message;
        }
        return data;
    }


    _asyncSearch(filterStr,_scope){
        var prom = new Promise((resolve, reject)=>{
        
            this.client.search(_scope,{scope:"sub",filter:filterStr}, function(err, res) {
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
        if(this._resolveBusyState) this._resolveBusyState();
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
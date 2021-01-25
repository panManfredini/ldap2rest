import {ldapController} from "../src/ldapController.js";


/**
 * Minimal testing suite, you need to run "npm run ldap-test-server".
 * This is really to see if I've done the async wrapping correctly,
 * the problem is that for how ldapjs is done, is very difficult to mock, 
 * so the actual faster thing is to test against real ldap.
 */
describe("LDAP Controller test suite",()=>{
    //var url = "ldap://localhost"
    var url = "ldap://localhost:1389"
    var Base = "dc=example,dc=org";
    var BindAdm = "cn=admin,dc=example,dc=org";
    var PW = "admin";
    var ldap = new ldapController(url,Base,BindAdm, PW);
    var test_user = {
        cn: 'macio',
        sn: 'bar',
        mail: 'foo@bar.com',
        objectClass: 'inetOrgPerson'
    }
    var user_mod = {
        operation: 'replace',
        modification: {
            mail: 'bar@bar.com'
        }
    }
    beforeEach(()=>{
        ldap.adminDN = BindAdm;
        ldap.ldapUrl = url;
        ldap.baseDN = Base;
        ldap.adminPW = PW;
    });

    afterEach(()=>{
        ldap.Disconnect();
    });

    test('It exists', () => {
        expect(ldap).not.toBeNull();
    }); 
    
    test("Connect - Throw when fail",async()=>{
        ldap.ldapUrl = "ldap://localhost:3001";
        var err = false;
        try{ await ldap.Connect(); }
        catch{ err=true;}
        expect( ldap.client.listenerCount() ).toEqual(0);
        expect(ldap.client.connected).toBeFalsy();
    });

    test("Connect - succeed ", async()=>{
        await ldap.Connect() ;
        expect(ldap.client.connected).toBeTruthy();
        ldap.Disconnect();
        expect( ldap.client.connected ).toEqual(false);
    });

    test("Add", async()=>{
        await ldap.Connect();
        await ldap.Add(`cn=${test_user.cn},${Base}`, test_user);
    });

    test("Search", async ()=>{
        await ldap.Connect();
        var data = await ldap.Search("(&(objectClass=inetOrgPerson)(cn=macio))");
        let valid_data = {
            entries: [Object.assign({}, test_user, {dn:'cn=macio,'+Base, controls: []})],
            success: true,
            error: ''
        }
        expect(data).toEqual(valid_data);
    });

    test("Search error", async()=>{
        ldap.baseDN = "dc=notExist";
        await ldap.Connect();
        var data = await ldap.Search("(&(objectclass=person))");
        expect(data).toEqual({entries:[], success: false, error:"No Such Object"});
    });

    test("Modify", async()=>{
        await ldap.Connect();
        await ldap.Modify(`cn=${test_user.cn},${Base}`, user_mod);
        var data = await ldap.Search("(&(objectClass=inetOrgPerson)(cn=macio))");
        expect(data.entries[0].mail).toEqual(user_mod.modification.mail);
    });

    test("Delete", async()=>{
        await ldap.Connect();
        await ldap.Delete(`cn=${test_user.cn},${Base}`);
        var data = await ldap.Search("(&(objectClass=inetOrgPerson)(cn=macio))");
        expect(data.entries.length).toEqual(0);
        
    });
    
});

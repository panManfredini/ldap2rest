import {ldapController} from "./ldapController.js"
import {loggerSTDout as logger} from "./damnSimpleLogger.js"
import {config} from "./config.js"


export const ldap = new ldapController(config.url, config.base, config.bindAdmin, config.pw);

ldap.test = testConnection;

async function testConnection()
{
    try{
        await ldap.Connect();
        logger.info("Connected to LDAP server successfully");
    }
    catch(e){
        logger.err(`LDAP connection failed: ${e.message}`);
    }
    finally{
        ldap.Disconnect();
    }
}
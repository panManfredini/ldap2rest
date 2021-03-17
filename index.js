import Koa from "koa"
import bodyParser from 'koa-bodyparser'
import cors from "@koa/cors"
import {config} from "./src/config.js"
import {router} from './src/routes.js'
import {loggerSTDout} from './src/damnSimpleLogger.js'
import {ldap} from "./src/ldapInit.js"


var app = new Koa();
    
	loggerSTDout.info("Starting LDAP-to-REST...");

	// Config
	var logger = new loggerSTDout();
	app.use(logger.logger);
	if(config.cors) app.use(cors());
	app.use(bodyParser( { enableTypes:['json'] } ));
	app.use(router.routes());

	// test ldap
	ldap.test();
  
app.listen(config.port);
loggerSTDout.info(`Started. Listening on port ${config.port}`);


import Koa from "koa"
import bodyParser from 'koa-bodyparser'
import morgan from 'koa-morgan'
import {config} from "./src/config.js"
import {router} from './src/routes.js'
import {loggerSTDout} from './src/damnSimpleLogger.js'
import {ldap} from "./src/ldapInit.js"


var app = new Koa();
    
	loggerSTDout.info("Starting LDAP-to-REST...");

	// Config
	var logger = new loggerSTDout();
	app.use(logger.logger);
	app.use(bodyParser( { enableTypes:['json'] } ));
	//app.use(morgan('combined'));
	app.use(router.routes());

	// test ldap
	ldap.test();
  
app.listen(config.port);
loggerSTDout.info(`Started. Listening on port ${config.port}`);


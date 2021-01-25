export class loggerSTDout
{
    static info(str){
    	console.info(`${new Date().toUTCString()} INFO  - ${str}`);
    }

    static warn(str){
    	console.warn(`${new Date().toUTCString()} WARN  - ${str}`);
    }

    static err(str){
       console.error(`${new Date().toUTCString()} ERROR - ${str}`);
    }

    async logger(ctx,next)
    {
        await next();
        if(!ctx.url.includes("health")) loggerSTDout.info(`${ctx.method}  ${ctx.url} --> ${ctx.status}`);
    }
}

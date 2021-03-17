var _prefix = process.env.L2H_PREFIX || "";
var _cors = process.env.L2H_ALLOW_CORS || "false";
var _url      = process.env.L2H_LDAP_URL || "ldap://localhost:389";
var _base     = process.env.L2H_BASE_DN  || "dc=example,dc=org";
var _bindAdm  = process.env.L2H_ADMIN_DN || "cn=admin,dc=example,dc=org";
var _pw       = process.env.L2H_ADMIN_PW || "admin";
var _port = parseInt(process.env.L2H_PORT || "3000",10);
var _users_scope  = process.env.L2H_USER_SCOPE || "";


export const config =
{ 
    prefix :_prefix,
    url: _url,
    base: _base,
    bindAdmin: _bindAdm,
    pw: _pw,
    port: _port,
    users_scope : _users_scope,
    cors: (_cors.toLowerCase() === "true")
}

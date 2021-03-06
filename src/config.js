var _prefix = process.env.L2H_PREFIX || "";
var _cors = process.env.L2H_ALLOW_CORS || "false";
var _url      = process.env.L2H_LDAP_URL || "ldap://localhost:389";
var _base     = process.env.L2H_BASE_DN  || "dc=example,dc=org";
var _bindAdm  = process.env.L2H_ADMIN_DN || "cn=admin,dc=example,dc=org";
var _pw       = process.env.L2H_ADMIN_PW || "admin";
var _groups_scope = process.env.L2H_GROUP_SCOPE || "";
var _group_name_attr = process.env.L2H_GROUP_NAME_ATTR || "cn";
var _port = parseInt(process.env.L2H_PORT || "3000",10);
var _users_scope  = process.env.L2H_USER_SCOPE || "";
var _generate_pw  = process.env.L2H_GENERATE_PW || "true";


export const config =
{ 
    prefix :_prefix,
    url: _url,
    base: _base,
    bindAdmin: _bindAdm,
    pw: _pw,
    port: _port,
    users_scope : _users_scope,
    cors: (_cors.toLowerCase() === "true"),
    groups_scope : _groups_scope,
    group_name_attr: _group_name_attr,
    generate_pw : ( _generate_pw.toLowerCase() === "true" )
}

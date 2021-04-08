# ldap2rest
Simple and very opinionated REST client for OpenLDAP

# Run with docker

```bash
docker run --rm -it -p 3000:3000 -e L2H_LDAP_URL="ldap://<url>" \
	-e L2H_BASE_DN="dc=example,dc=org" \
	-e L2H_ADMIN_DN="cn=admin,dc=example,dc=org" \
	-e L2H_ADMIN_PW="password" \
	xenoscopesc/ldap2rest:v0.5
```

# Configs

| Env. variable name | Default value | Notes |
|--------------------|---------------|-------|
|L2H_PREFIX          | none          | prefix to use behind a proxy| 
|L2H_ALLOW_CORS      | "false"       | if to allow cors and put response headers| 
|L2H_PORT            | 3000          | listen on port |
|L2H_LDAP_URL        | ldap://localhost:389 | ldap server full url including port |
|L2H_BASE_DN         | dc=example,dc=org | base DN for searches |
|L2H_ADMIN_DN        | cn=admin,dc=example,dc=org | DN of admin |
|L2H_ADMIN_PW        | admin | password of admin |
|L2H_USER_SCOPE      | empty | additional organization unit for users, for example "ou=Persons"|
|L2H_GROUP_ADDINTIONAL_DN| "" | additional dn to add to group, example "ou=groups"|
|L2H_GROUP_NAME_ATTR| "cn" | attribute that holds the name of the group|
|L2H_GENERATE_PW| "true" | defines if to generate a random password when creating user.|

### Notes

- The search filter for groups is "(&(member={user_dn})(objectclass=groupOfNames))".
- The search filter for users is "(objectClass=inetOrgPerson)".

# API

```js
// Routes - Methods and Data structure

// Route: "/users"
// Method: GET
// Data structure

{
    entries:[
      dn: "uid=scadmin,ou=users,dc=xenoscope,dc=org",
      controls: [],
      objectClass: "inetOrgPerson",
      uid: "username",
      sn: " ",
      cn: " ",
      displayName: "Full Name",
      userPassword: " ",
      mail: "email",
      mobile: "phone number",
      group: {
        dn: "cn=admins,ou=groups,dc=xenoscope,dc=org",
        controls: [],
        cn: "admins",
        objectClass: "groupOfNames",
        member: ["list of dn"]
      }
    }
    ], 
    success: bool, 
    error: string   
}  

// Route: "/groups"
// Method: GET
// Data structure
{
  "entries": [
    {
      "dn": "cn=admins,ou=groups,dc=xenoscope,dc=org",
      "controls": [],
      "cn": "admins",
      "objectClass": "groupOfNames",
      "member": "uid=scadmin,ou=users,dc=xenoscope,dc=org"
    },
    ....
  ],
  "success": true,
  "error": ""
}


// Route: "/create"
// Method: POST
// Data structure
{
	"uid":"username",
	"displayName":"Full Name",
	"mobile":"06992934843",
	"mail":"j.snow@gmail.com"
}

// Route: "/update"
// Method: POST
// Data structure
{
	"dn":"uid=john,ou=users,dc=xenoscope,dc=org",
	"updates":{
		"displayName": "new Display name",
		"mail": "new email",
		"mobile": "new phone"
	}
}

// Route: "/delete"
// Method: POST
// Data structure
{
	"dn_user":"uid=johdsn,ou=users,dc=xenoscope,dc=org"
}


// Route: "/groups/add_member"
// Method: POST
// Data structure
{
	"dn_group":"cn=writers,ou=groups,dc=xenoscope,dc=org",
	"dn_user":"uid=johdsn,ou=users,dc=xenoscope,dc=org"
}


// Route: "/groups/delete_member"
// Method: POST
// Data structure
{
	"dn_group":"cn=writers,ou=groups,dc=xenoscope,dc=org",
	"dn_user":"uid=johdsn,ou=users,dc=xenoscope,dc=org"
}
```

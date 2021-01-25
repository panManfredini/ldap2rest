# ldap2rest
Simple and very opinionated REST client for OpenLDAP

# Configs

| Env. variable name | Default value | Notes |
|--------------------|---------------|-------|
|L2H_PREFIX          | none          | prefix to use behind a proxy| 
|L2H_PORT            | 3000          | listen on port |
|L2H_LDAP_URL        | ldap://localhost:389 | ldap server full url including port |
|L2H_BASE_DN         | dc=example,dc=org | base DN for searches |
|L2H_ADMIN_DN        | cn=admin,dc=example,dc=org | DN of admin |
|L2H_ADMIN_PW        | admin | password of admin |
|L2H_USER_SCOPE      | empty | additional organization unit for users, for example "ou=Persons"|

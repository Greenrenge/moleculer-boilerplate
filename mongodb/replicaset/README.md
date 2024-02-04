you will need below lines in your /etc/hosts file

```
127.0.0.1	mongoset1
127.0.0.1	mongoset2
127.0.0.1	mongoset3
```

the port exposed from docker and the port in the mongod should be same

with default env
you may need to run this by admin user after create db=boilerplate

```
use boilerplate
db.createUser(
 {
  user: "app",
  pwd: "password",
  roles: [{ role: "userAdminAnyDatabase", db: "admin"}, { role: "clusterAdmin", db: "admin"}]
  })

```

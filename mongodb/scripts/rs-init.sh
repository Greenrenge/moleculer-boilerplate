#!/bin/bash

mongosh --port 27021 <<EOF
var config = {
    "_id": "${MONGO_REPLICA_SET_NAME}",
    "version": 1,
    "members": [
        {
            "_id": 1,
            "host": "mongoset1:27021",
            "priority": 3
        },
        {
            "_id": 2,
            "host": "mongoset2:27022",
            "priority": 2
        },
        {
            "_id": 3,
            "host": "mongoset3:27023",
            "priority": 1
        }
    ]
};

print("====== DEBUG ======");
printjson(config);
print("===================");

rs.initiate(config, { force: true });
rs.status();
EOF
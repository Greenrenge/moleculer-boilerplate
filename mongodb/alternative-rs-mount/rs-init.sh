#!/bin/bash

# https://blog.tericcabrel.com/mongodb-replica-set-docker-compose/
# needs to set /etc/hosts to have
# 127.0.0.1       mongoset1 mongoset2 mongoset3

mongosh <<EOF
var config = {
    "_id": "rs0",
    "version": 1,
    "members": [
        {
            "_id": 1,
            "host": "mongoset1:27017",
            "priority": 3
        },
        {
            "_id": 2,
            "host": "mongoset2:27017",
            "priority": 2
        },
        {
            "_id": 3,
            "host": "mongoset3:27017",
            "priority": 1
        }
    ]
};
rs.initiate(config, { force: true });
rs.status();
EOF
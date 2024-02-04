#!/bin/bash

mongosh --port 27021 <<EOF

rs.initiate({
    "_id": "${MONGO_REPLICA_SET_NAME}",
    "version": 1,
    "members": [
        {
            "_id": 1,
            "host": "mongoset1:27021",
            "priority": 3
        }
    ]
}, { force: true });
rs.status();
EOF

echo "\\n====== NEXT TRY WITH USER ======\\n"

# use admin
# db.auth("${MONGO_CL_ADMIN_USERNAME}","${MONGO_CL_ADMIN_PASSWORD}");
# try by user pass
mongosh --port 27021 -u ${MONGO_CL_ADMIN_USERNAME} -p ${MONGO_CL_ADMIN_PASSWORD} <<EOF

var config = {
    "_id": "${MONGO_REPLICA_SET_NAME}",
    "version": 1,
    "members": [
        {
            "_id": 1,
            "host": "mongoset1:27021",
            "priority": 3
        }
    ]
};

print("====== DEBUG ======");
printjson(config);
print("===================");


rs.initiate(config,{ force: true });
rs.status();
EOF



# #try by user pass
# mongosh --port 27021  <<EOF
# use admin
# db.auth("${MONGO_CL_ADMIN_USERNAME}","${MONGO_CL_ADMIN_PASSWORD}");
# rs.initiate({
#     "_id": "${MONGO_REPLICA_SET_NAME}",
#     "version": 1,
#     "members": [
#         {
#             "_id": 1,
#             "host": "mongoset1:27021",
#             "priority": 3
#         }
#     ]
# }, { force: true });
# rs.status();
# EOF
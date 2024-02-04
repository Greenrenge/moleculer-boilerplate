#!/bin/bash

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd )"


read -p "generate new key (Y/N)?" gen_key
if [[ $gen_key == "Y" || $gen_key == "y" ]]; then
    rm -rf g/auth/ .env
    chmod +x $DIR/scripts/*.sh

    echo "MongoDB Replica Set Configuration Tool"
    echo "Generating a key ..."
    mkdir -p $DIR/config/auth
    openssl rand -base64 700 > $DIR/config/auth/key
    echo "Changing permission to $DIR/config/auth/key"
    chmod 600 $DIR/config/auth/key
fi


#convert ./.env to variables
set -a
. $DIR/config/.env
set +a

# print imported env
echo "#### MongoDB Configuration"
echo "MONGO_INITDB_ROOT_USERNAME=$MONGO_INITDB_ROOT_USERNAME"
echo "MONGO_INITDB_ROOT_PASSWORD=$MONGO_INITDB_ROOT_PASSWORD"
echo "MONGO_REPLICA_SET_NAME=$MONGO_REPLICA_SET_NAME"
echo "MONGO_CL_ADMIN_USERNAME=$MONGO_CL_ADMIN_USERNAME"
echo "MONGO_CL_ADMIN_PASSWORD=$MONGO_CL_ADMIN_PASSWORD"
echo "MONGO_REPLICA_SET_ADDR1=$MONGO_REPLICA_SET_ADDR1"
echo "MONGO_REPLICA_SET_ADDR2=$MONGO_REPLICA_SET_ADDR2"
echo "MONGO_REPLICA_SET_ADDR3=$MONGO_REPLICA_SET_ADDR3"
echo "ME_CONFIG_BASICAUTH_USERNAME=$ME_CONFIG_BASICAUTH_USERNAME"
echo "ME_CONFIG_BASICAUTH_PASSWORD=$ME_CONFIG_BASICAUTH_PASSWORD"


read -p "Single Node (Y/N)?" mode
if [[ $mode == "Y" || $mode == "y" ]]; then
    echo "Single Node Mode"
    
    docker compose -p local_mongors down
    
    docker compose -p local_mongors -f $DIR/single-node-replicaset/docker-compose.yml up -d --build -V --remove-orphans
else 

    docker compose -p local_mongors -f $DIR/replicaset/docker-compose.yml up -d --build -V --remove-orphans

fi
# # -v option will remove all volumes after the containers are removed.
# docker compose down -v

# if [[ -z $1 ]]; then
#     echo "[DEFAULT] Composing docker-compose.yml"
#     docker compose up -p local_mongors -d --build -V --remove-orphans
# else
#     echo "Composing $1"
#     docker compose -f $1 -p local_mongors up -d --build -V --remove-orphans
# fi

echo "Waiting for all services up..."
sleep 15


echo "Running initialization script..."
# docker exec mongodb /scripts/rs-init.sh
if [[ $mode == "Y" || $mode == "y" ]]; then
    docker exec -i mongoset1 bash < $DIR/scripts/single-init.sh
else 
    docker exec -i mongoset1 bash < $DIR/scripts/rs-init.sh
fi
docker compose restart

sleep 30

echo "Running root and admin users ..."
# docker exec mongodb /scripts/user-init.sh
docker exec -i mongoset1 bash < $DIR/scripts/user-init.sh

printf "\n\nMongoDB Replica Set started.\n"
printf "For inspecting and testing the MongoDB Replica Set\n"
echo   "visit the http://192.168.1.33:8081 or you can use the python script in the test folder."
printf "\nMake sure to install pymongo:\n"
printf "  $ pip install pymongo --user\n"
printf "and execute the script:\n"
printf "  $ python3 test/insert_demo.py\n"
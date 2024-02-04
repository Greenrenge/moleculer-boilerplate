#!/bin/bash

docker compose up -d

sleep 30

docker exec mongo1 bin/bash /scripts/rs-init.sh
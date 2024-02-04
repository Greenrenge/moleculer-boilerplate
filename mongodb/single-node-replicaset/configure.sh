#!/bin/bash

docker compose -p local_mongors down
DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd )"

docker compose -p local_mongors -f $DIR/docker-compose.yml up -d --build -V --remove-orphans

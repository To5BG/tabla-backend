#!/bin/bash
set -a
source .env
set +a; 

# run container
docker run \
  --name $DOCKER_CONTAINER \
  --rm \
  -e POSTGRES_PASSWORD=$POSTGRES_PASSWORD \
  -e POSTGRES_DB=$POSTGRES_DATABASE \
  -e POSTGRES_USER=$POSTGRES_USERNAME \
  -v $DOCKER_VOLUME:/var/lib/postgresql/data \
  -p $POSTGRES_PORT:5432 \
  -d postgres

# allow time for cont init
SLEEP 2;

# sanity-check by listing all databases on this port
echo "\l" | docker exec -i $DOCKER_CONTAINER psql -U $POSTGRES_USERNAME $POSTGRES_DATABASE
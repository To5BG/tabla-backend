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
  -e POSTGRES_USER=$POSTGRES_USER \
  -v $DOCKER_VOLUME:/var/lib/postgresql/data \
  -p 5433:5432 \
  -d postgres

SLEEP 2;

echo "\l" | docker exec -i $DOCKER_CONTAINER psql -U $POSTGRES_USER $POSTGRES_DATABASE
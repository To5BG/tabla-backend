#!/bin/bash
set -a
source .env
set +a; 

# run redis container
docker run \
  --name $DOCKER_CACHE_CONTAINER \
  --rm \
  -v $DOCKER_CACHE_VOLUME:/data \
  -h $REDIS_HOST \
  -p $REDIS_PORT:6379 \
  -d redis redis-server --requirepass $REDIS_PASSWORD

# run postgreSQL container
docker run \
  --name $DOCKER_DATABASE_CONTAINER \
  --rm \
  -e POSTGRES_PASSWORD=$POSTGRES_PASSWORD \
  -e POSTGRES_DB=$POSTGRES_DATABASE \
  -e POSTGRES_USER=$POSTGRES_USERNAME \
  -v $DOCKER_DATABASE_VOLUME:/var/lib/postgresql/data \
  -p $POSTGRES_PORT:5432 \
  -d postgres

# allow time for cont init
SLEEP 2;

# sanity-check by listing all databases on this port
echo "\l" | docker exec -i $DOCKER_DATABASE_CONTAINER psql -U $POSTGRES_USERNAME $POSTGRES_DATABASE
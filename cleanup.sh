#!/bin/bash

echo
echo "---------------------------------------------------------------------------------"
echo "Entering Repositories Cleanup Script"
echo "---------------------------------------------------------------------------------"
echo

echo
echo "Setting Up Resource Paths"
echo

# project's root directory
PROJECT_ROOT_DIR="$(cd "$(dirname "$0")" && pwd)"

echo
echo "Setting Up Script Variables"
echo




# Server Properties
DOMAIN=miles.co.ke
DEFAULT_SERVER_SUBDOMAIN=geodatabase.miles.co.ke
RABBITMQ_SERVER_SUBDOMAIN=geodatabase.miles.co.ke
TRAEFIK_SERVER_SUBDOMAIN=geodatabase.miles.co.ke


# Postgres Properties
USERNAME=postgres
PASSWORD=postgres


# Use the flags 1 and 0 below to configure the cleanup that you want to perform
# 1 = on, 0 = off
# ----------------------------------------------------------------------------------

REPLACE_DOMAIN_NAMES=1
DELETE_BUILD_DIRECTORIES=1
UPDATE_POSTGRES_CREDENTIALS=0
FIX_MISSING_DOCKER_DOMAIN=1

echo
echo "Cleaning Up"
echo


if [ $DELETE_BUILD_DIRECTORIES -eq 1 ]; then
    echo
    echo "Deleting build directories"
    echo
    find . -type d -name "target" -exec rm -rf "{}" \;
fi


if [ $REPLACE_DOMAIN_NAMES -eq 1 ]; then

    echo
    echo "Replacing Domain Names"
    echo

    # yaml files
    find $PROJECT_ROOT_DIR -type f -iname '*.yaml' -exec sed -i.bak 's/cloud.miles.co.ke/'$DEFAULT_SERVER_SUBDOMAIN'/' "{}" +
    find $PROJECT_ROOT_DIR -type f -iname '*.yaml' -exec sed -i.bak 's/systems.miles.co.ke/'$DEFAULT_SERVER_SUBDOMAIN'/' "{}" +
    find $PROJECT_ROOT_DIR -type f -iname '*.yaml' -exec sed -i.bak 's/rabbitmq.miles.co.ke/'$RABBITMQ_SERVER_SUBDOMAIN'/' "{}" +
    find $PROJECT_ROOT_DIR -type f -iname '*.yaml' -exec sed -i.bak 's/traefik.miles.co.ke/'$TRAEFIK_SERVER_SUBDOMAIN'/' "{}" +
    find $PROJECT_ROOT_DIR -type f -iname '*.yaml' -exec sed -i.bak 's/miles.co.ke/'$DOMAIN'/' "{}" +

    # property files
    find $PROJECT_ROOT_DIR -type f -iname '*.properties' -exec sed -i.bak 's/cloud.miles.co.ke/'$DEFAULT_SERVER_SUBDOMAIN'/' "{}" +
    find $PROJECT_ROOT_DIR -type f -iname '*.properties' -exec sed -i.bak 's/systems.miles.co.ke/'$DEFAULT_SERVER_SUBDOMAIN'/' "{}" +    
    find $PROJECT_ROOT_DIR -type f -iname '*.properties' -exec sed -i.bak 's/rabbitmq.miles.co.ke/'$RABBITMQ_SERVER_SUBDOMAIN'/' "{}" +
    find $PROJECT_ROOT_DIR -type f -iname '*.properties' -exec sed -i.bak 's/traefik.miles.co.ke/'$TRAEFIK_SERVER_SUBDOMAIN'/' "{}" +
    find $PROJECT_ROOT_DIR -type f -iname '*.properties' -exec sed -i.bak 's/miles.co.ke/'$DOMAIN'/' "{}" +

    # xml files
    find $PROJECT_ROOT_DIR -type f -iname '*.xml' -exec sed -i.bak 's/cloud.miles.co.ke/'$DEFAULT_SERVER_SUBDOMAIN'/' "{}" +
    find $PROJECT_ROOT_DIR -type f -iname '*.xml' -exec sed -i.bak 's/systems.miles.co.ke/'$DEFAULT_SERVER_SUBDOMAIN'/' "{}" +    
    find $PROJECT_ROOT_DIR -type f -iname '*.xml' -exec sed -i.bak 's/rabbitmq.miles.co.ke/'$RABBITMQ_SERVER_SUBDOMAIN'/' "{}" +
    find $PROJECT_ROOT_DIR -type f -iname '*.xml' -exec sed -i.bak 's/traefik.miles.co.ke/'$TRAEFIK_SERVER_SUBDOMAIN'/' "{}" +
    find $PROJECT_ROOT_DIR -type f -iname '*.xml' -exec sed -i.bak 's/miles.co.ke/'$DOMAIN'/' "{}" +

    # json files
    find $PROJECT_ROOT_DIR -type f -iname '*.json' -exec sed -i.bak 's/cloud.miles.co.ke/'$DEFAULT_SERVER_SUBDOMAIN'/' "{}" +
    find $PROJECT_ROOT_DIR -type f -iname '*.json' -exec sed -i.bak 's/systems.miles.co.ke/'$DEFAULT_SERVER_SUBDOMAIN'/' "{}" +    
    find $PROJECT_ROOT_DIR -type f -iname '*.json' -exec sed -i.bak 's/rabbitmq.miles.co.ke/'$RABBITMQ_SERVER_SUBDOMAIN'/' "{}" +
    find $PROJECT_ROOT_DIR -type f -iname '*.json' -exec sed -i.bak 's/traefik.miles.co.ke/'$TRAEFIK_SERVER_SUBDOMAIN'/' "{}" +
    find $PROJECT_ROOT_DIR -type f -iname '*.json' -exec sed -i.bak 's/miles.co.ke/'$DOMAIN'/' "{}" +

    # conf files
    find $PROJECT_ROOT_DIR -type f -iname '*.conf' -exec sed -i.bak 's/cloud.miles.co.ke/'$DEFAULT_SERVER_SUBDOMAIN'/' "{}" +
    find $PROJECT_ROOT_DIR -type f -iname '*.conf' -exec sed -i.bak 's/systems.miles.co.ke/'$DEFAULT_SERVER_SUBDOMAIN'/' "{}" +    
    find $PROJECT_ROOT_DIR -type f -iname '*.conf' -exec sed -i.bak 's/rabbitmq.miles.co.ke/'$RABBITMQ_SERVER_SUBDOMAIN'/' "{}" +
    find $PROJECT_ROOT_DIR -type f -iname '*.conf' -exec sed -i.bak 's/traefik.miles.co.ke/'$TRAEFIK_SERVER_SUBDOMAIN'/' "{}" +
    find $PROJECT_ROOT_DIR -type f -iname '*.conf' -exec sed -i.bak 's/miles.co.ke/'$DOMAIN'/' "{}" +

fi


if [ $FIX_MISSING_DOCKER_DOMAIN -eq 1 ]; then
    echo
    echo "Fixing Missing Docker Domain"
    echo

    find . -type f -name "pom.xml" -exec sed -i 's#<docker.image.prefix>.*#<docker.image.prefix>'${DEFAULT_SERVER_SUBDOMAIN}':5043</docker.image.prefix>#' "{}" \;
    find . -type f -name "values.yaml" -exec sed -i 's/id\: \:5043/id\: '${DEFAULT_SERVER_SUBDOMAIN}':5043/g' "{}" \;
fi


if [ $UPDATE_POSTGRES_CREDENTIALS -eq 1 ]; then
    echo
    echo "Updating postgres credentials"
    echo

    # Clear
    find . -type f -name "postgres.properties" -exec sed -i '/postgres.username=/d' "{}" \;
    find . -type f -name "postgres.properties" -exec sed -i '/postgres.password=/d' "{}" \;

    # Set
    find . -type f -name "postgres.properties" -exec sed -i '$ a postgres.username='$USERNAME "{}" \;
    find . -type f -name "postgres.properties" -exec sed -i '$ a postgres.password='$PASSWORD "{}" \;
fi


echo
echo "Removing backup files"
echo
find . -type f -name '*.bak' -print -delete


echo
echo "---------------------------------------------------------------------------------"
echo "Leaving Repositories Cleanup Script"
echo "---------------------------------------------------------------------------------"
echo

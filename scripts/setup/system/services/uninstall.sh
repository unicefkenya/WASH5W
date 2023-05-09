#!/bin/bash

echo 
echo "************************************************************************"
echo " Entering Services Unistallation Script"
echo "************************************************************************"
echo 

# ------------------------------------------------------------------------
# INITIALIZE SHELL COLOR VARIABLES
# ------------------------------------------------------------------------

RED_COLOR='\033[0;31m'
GREEN_COLOR='\033[0;32m'
NO_COLOR='\033[0m'

# ------------------------------------------------------------------------
# INITIALIZE PATH VARIABLES
# ------------------------------------------------------------------------


# /project/scripts/setup/system/services
SERVICES_DIR="$(cd "$(dirname "$0")" && pwd)"

# /project/scripts/setup/system
SYSTEM_DIR="$(dirname "$SERVICES_DIR")"

# /project/scripts/setup
SETUP_DIR="$(dirname "$SYSTEM_DIR")"

# /project/scripts
SCRIPTS_DIR="$(dirname "$SETUP_DIR")"

# /project
PROJECT_DIR="$(dirname "$SCRIPTS_DIR")"


# ------------------------------------------------------------------------
# INITIALIZE MICROSERVICES ARRAY - IN DEPENDENCY-SENSITIVE ORDER
# ------------------------------------------------------------------------

MICROSERVICES=(
	"administrative_hierarchies"
	"administrative_hierarchies_types"
	"administrative_hierarchies_types_units_types"
	"admin_hierarchies_types_units_types_subsidiaries"
	"administrative_units"
	"administrative_units_types"
	"age_brackets"
	"indicators"
	"organisations"
	"organisations-categories"
	"orgs_climate_actions"
	"orgs_specialisation_areas"
	"outputs"
	"outcomes"
	"reports"
	"reporting_periods"
	"sexes"
	"systems_modules"
	"systems_modules_permissions"
	"systems_users"
	"systems_users_roles"
	"systems_users_roles_permissions"
	"units"
	"value_chains"
)



# ------------------------------------------------------------------------
# BUILD MICROSERVICES
# ------------------------------------------------------------------------

for MICROSERVICE in "${MICROSERVICES[@]}"; do

	bash $PROJECT_DIR/services/$MICROSERVICE/uninstall.sh

done



echo 
echo "************************************************************************"
echo " Leaving Services Unistallation Script"
echo "************************************************************************"
echo 

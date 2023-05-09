#!/bin/sh
# See: https://stackoverflow.com/questions/6405127/how-do-i-specify-a-password-to-psql-non-interactively#6405296
# See: https://stackoverflow.com/questions/14549270/check-if-database-exists-in-postgresql-using-shell


echo
echo "---------------------------------------------------------------------------------"
echo "Entering databases Initialization Script"
echo "---------------------------------------------------------------------------------"
echo


# ----------------------------------------------------------------------------------
# INITIALIZE OUTPUT THEME
# ----------------------------------------------------------------------------------

RED_COLOR='\033[0;31m'
GREEN_COLOR='\033[0;32m'
NO_COLOR='\033[0m'



# ----------------------------------------------------------------------------------
# INITIALIZE RESOURCE PATHS VARIABLES
# ----------------------------------------------------------------------------------


# root/project/scripts/setup/system/databases
DATABASES_DIR="$(cd "$(dirname "$0")" && pwd)"

# root/project/scripts/setup/system
SYSTEM_DIR="$(dirname "$DATABASES_DIR")"

# root/project/scripts/setup
SETUP_DIR="$(dirname "$SYSTEM_DIR")"

# root/project/scripts
SCRIPTS_DIR="$(dirname "$SETUP_DIR")"

# root/project/
PROJECT_DIR="$(dirname "$SCRIPTS_DIR")"


# ----------------------------------------------------------------------------------
# INITIALIZE DATABASE CONNECTION PROPERTIES
# ----------------------------------------------------------------------------------

export PGHOST="localhost"
export PGPORT="5432"
#export PGPORT="31392"
export PGUSER="postgres"
export PGPASSWORD="postgres"



# ----------------------------------------------------------------------------------
# SET UP HIERARCHICAL ENTITIES DATABASES
# ----------------------------------------------------------------------------------


HIERARCHICAL_ENTITIES_DATABASES=(
	"administration"	
)


for DATABASE in "${HIERARCHICAL_ENTITIES_DATABASES[@]}"; do


  echo
  echo -e "${RED_COLOR}Setting up the $DATABASE databases${NO_COLOR}"
  echo "---------------------------------------------------------------------------------"
  echo


  # Create or recreate the database
  echo
  echo -e "${GREEN_COLOR}Creating (or recreating) the $DATABASE database${NO_COLOR}"
  echo
  psql -c "DROP DATABASE IF EXISTS $DATABASE"
  psql -c "CREATE DATABASE $DATABASE"


  # Set up the entities types table
  echo
  echo
  echo -e "${GREEN_COLOR}Setting up the $DATABASE entities types table${NO_COLOR}"
  echo
  psql -d $DATABASE -1 -f "$PROJECT_DIR/services/entities-types/src/main/resources/entities_types.sql"
  psql -d $DATABASE -1 -c "\copy entity_type(data,version) from '$PROJECT_DIR/data/$DATABASE/entities_types.csv' DELIMITER ',' CSV HEADER"


  # Set up the entities table
  echo
  echo
  echo -e "${GREEN_COLOR}Setting up the $DATABASE entities table${NO_COLOR}"
  echo
  psql -d $DATABASE -1 -f "$PROJECT_DIR/services/entities/src/main/resources/entities.sql"
  psql -d $DATABASE -1 -c "\copy entity(data,version) from '$PROJECT_DIR/data/$DATABASE/entities.csv' DELIMITER ',' CSV HEADER"


  # Set up the accountabilities hierarchies table
  echo
  echo
  echo -e "${GREEN_COLOR}Setting up the $DATABASE accountabilities hierarchies table${NO_COLOR}"
  echo
  psql -d $DATABASE -1 -f "$PROJECT_DIR/services/accountabilities-hierarchies/src/main/resources/accountabilities_hierarchies.sql"
  psql -d $DATABASE -1 -c "\copy accountability_hierarchy(data,version) from '$PROJECT_DIR/data/$DATABASE/accountabilities_hierarchies.csv' DELIMITER ',' CSV HEADER"


  # Set up the accountabilities types table
  echo
  echo
  echo -e "${GREEN_COLOR}Setting up the $DATABASE accountabilities types table${NO_COLOR}"
  echo
  psql -d $DATABASE -1 -f "$PROJECT_DIR/services/accountabilities-types/src/main/resources/accountabilities_types.sql"
  psql -d $DATABASE -1 -c "\copy accountability_type(data,version) from '$PROJECT_DIR/data/$DATABASE/accountabilities_types.csv' DELIMITER ',' CSV HEADER"


  # Set up the accountabilities table
  echo
  echo
  echo -e "${GREEN_COLOR}Setting up the $DATABASE accountabilities table${NO_COLOR}"
  echo
  psql -d $DATABASE -1 -f "$PROJECT_DIR/services/accountabilities/src/main/resources/accountabilities.sql"
  psql -d $DATABASE -1 -c "\copy accountability(data,version) from '$PROJECT_DIR/data/$DATABASE/accountabilities.csv' DELIMITER ',' CSV HEADER"

done



# ----------------------------------------------------------------------------------
# SET UP INDEPENDENT ENTITIES DATABASES
# ----------------------------------------------------------------------------------


INDEPENDENT_TYPED_ENTITIES_DATABASES=()


for DATABASE in "${INDEPENDENT_TYPED_ENTITIES_DATABASES[@]}"; do


  echo
  echo -e "${RED_COLOR}Setting up the $DATABASE databases${NO_COLOR}"
  echo "---------------------------------------------------------------------------------"
  echo


  # Create or recreate the database
  echo
  echo -e "${GREEN_COLOR}Creating (or recreating) the $DATABASE database${NO_COLOR}"
  echo
  psql -c "DROP DATABASE IF EXISTS $DATABASE"
  psql -c "CREATE DATABASE $DATABASE"


  # Set up the entities types table
  echo
  echo
  echo -e "${GREEN_COLOR}Setting up the $DATABASE entities types table${NO_COLOR}"
  echo
  psql -d $DATABASE -1 -f "$PROJECT_DIR/services/entities-types/src/main/resources/entities_types.sql"
  psql -d $DATABASE -1 -c "\copy entity_type(data,version) from '$PROJECT_DIR/data/$DATABASE/entities_types.csv' DELIMITER ',' CSV HEADER"


  # Set up the entities table
  echo
  echo
  echo -e "${GREEN_COLOR}Setting up the $DATABASE entities table${NO_COLOR}"
  echo
  psql -d $DATABASE -1 -f "$PROJECT_DIR/services/entities/src/main/resources/entities.sql"
  psql -d $DATABASE -1 -c "\copy entity(data,version) from '$PROJECT_DIR/data/$DATABASE/entities.csv' DELIMITER ',' CSV HEADER"


done


echo
echo "---------------------------------------------------------------------------------"
echo "Leaving databases Initialization Script"
echo "---------------------------------------------------------------------------------"
echo

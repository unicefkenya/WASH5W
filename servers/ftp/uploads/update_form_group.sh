#!/bin/bash

# Read the input JSON from the db.json file
json=$(cat db.json | jq '.data_forms_elements')

# Loop through each object in the JSON array
for obj in $(echo "${json}" | jq -c '.[]'); do
    # Add the new fields to the object
    obj=$(echo "${obj}" | jq '. + {"layoutId": 1, "index": .id, "code": (.data.title | ascii_downcase | gsub(" "; "_")), "titled": true}')
    # Output the modified object
    echo "${obj}"
done | jq -s '{ "data_forms_elements": . }' > modified.db.json


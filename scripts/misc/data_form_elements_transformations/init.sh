#!/bin/bash

# Read input file
input="input.json"
json=$(cat ${input})

# Update or create index field and initialize parentId field
new_json=$(echo ${json} | jq -c '.[] | if (.data.index? | not) then .data.index = .id else . end | if (.data.parentId? | not) then .data.parentId = null else . end')

# Write output file
output="output.json"
echo $(echo ${new_json} | jq -cs '.') > ${output}

#!/bin/bash

# Read input file
input="input.json"
json=$(cat ${input})

# Check for and initialize data.cumulative field
new_json=$(echo ${json} | jq -c '.[] | if (.data.cumulative? | not) then .data.cumulative = false else . end')

# Write output file
output="output.json"
echo ${new_json} | jq -sc '.' > ${output}

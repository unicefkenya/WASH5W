/*
 * Copyright (C) 2021 Second Mile
 *
 * This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0.
 * If a copy of the MPL was not distributed with this file,
 * You can obtain one at http://mozilla.org/MPL/2.0/.
 */
package ke.co.miles.entities.util.builders;

import java.text.ParseException;
import java.util.Optional;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.util.MultiValueMap;

/**
 * @author Kwaje Anthony <tony@miles.co.ke>
 * @version 1.0
 * @since 0.0.1
 */
public class QueryWhereClauseBuilder {

  private static final Logger LOGGER = LoggerFactory.getLogger(QueryWhereClauseBuilder.class);
  private MultiValueMap<String, String> queryParameters;

  public QueryWhereClauseBuilder queryParameters(MultiValueMap<String, String> queryParameters) {
    this.queryParameters = queryParameters;
    return this;
  }

  public String build() {

    final StringBuilder query = new StringBuilder();

    // Ids
    Long[] ids =
        this.queryParameters.get("ids") == null ? null :
            this.queryParameters
                .get("ids")
                .stream()
                .map(Long::parseLong)
                .sorted()
                .toArray(Long[]::new);

    if (ids != null && ids.length != 0) {
      if (ids.length == 1) {
        query.append("id = ").append(ids[0]);
      } else {
        query.append("id IN (");

        int i = 0;
        while (i < ids.length) {
          query.append(ids[i]);
          if (i < ids.length - 1) {
            query.append(",");
          }
          i++;
        }

        query.append(")");
      }
    }

    // Type
    Long typeId =
        queryParameters.get("type") == null ? null :
            queryParameters
                .get("type")
                .stream()
                .findFirst()
                .map(Long::parseLong)
                .orElse(null);

    if (typeId != null) {
      if (!query.toString().isEmpty()) {
        query.append(" AND ").append("((data->'types')::jsonb @> '").append(typeId)
            .append("' = true)");
      } else {
        query.append("((data->'types')::jsonb @> '").append(typeId).append("' = true)");
      }
    }

    // Group
    Long groupId =
        queryParameters.get("group") == null ? null :
            queryParameters
                .get("group")
                .stream()
                .findFirst()
                .map(Long::parseLong)
                .orElse(null);

    if (groupId != null) {
      if (!query.toString().isEmpty()) {
        query.append(" AND ").append("((data->'groups')::jsonb @> '").append(groupId)
            .append("' = true)");
      } else {
        query.append("((data->'groups')::jsonb @> '").append(groupId).append("' = true)");
      }
    }

    // Role
    Long roleId =
        queryParameters.get("role") == null ? null :
            queryParameters
                .get("role")
                .stream()
                .findFirst()
                .map(Long::parseLong)
                .orElse(null);

    if (roleId != null) {
      if (!query.toString().isEmpty()) {
        query.append(" AND ").append("((data->'roles')::jsonb @> '").append(roleId)
            .append("' = true)");
      } else {
        query.append("((data->'roles')::jsonb @> '").append(roleId).append("' = true)");
      }
    }

    // Level
    Long levelId =
        queryParameters.get("level") == null ? null :
            queryParameters
                .get("level")
                .stream()
                .findFirst()
                .map(Long::parseLong)
                .orElse(null);

    if (levelId != null) {
      if (!query.toString().isEmpty()) {
        query.append(" AND ").append("((data->'levels')::jsonb @> '").append(levelId)
            .append("' = true)");
      } else {
        query.append("((data->'levels')::jsonb @> '").append(levelId).append("' = true)");
      }
    }

    // Status
    Long statusId =
        queryParameters.get("status") == null ? null :
            queryParameters
                .get("status")
                .stream()
                .findFirst()
                .map(Long::parseLong)
                .orElse(null);

    if (statusId != null) {
      if (!query.toString().isEmpty()) {
        query.append(" AND ").append("((data->'statuses')::jsonb @> '").append(statusId)
            .append("' = true)");
      } else {
        query.append("((data->'statuses')::jsonb @> '").append(statusId).append("' = true)");
      }
    }

    // Location
    Long locationId =
        queryParameters.get("location") == null ? null :
            queryParameters
                .get("location")
                .stream()
                .findFirst()
                .map(Long::parseLong)
                .orElse(null);

    if (locationId != null) {
      if (!query.toString().isEmpty()) {
        query.append(" AND ").append("((data->'locations')::jsonb @> '").append(locationId)
            .append("' = true)");
      } else {
        query.append("((data->'locations')::jsonb @> '").append(locationId).append("' = true)");
      }
    }

    // Other
    this.queryParameters
        .keySet()
        .stream()
        .filter(key -> !(key.equalsIgnoreCase("ids")) &&
            !(key.equalsIgnoreCase("type")) &&
            !(key.equalsIgnoreCase("group")) &&
            !(key.equalsIgnoreCase("role")) &&
            !(key.equalsIgnoreCase("level")) &&
            !(key.equalsIgnoreCase("status")) &&
            !(key.equalsIgnoreCase("location")) &&
            !(key.equalsIgnoreCase("limit")) &&
            !(key.equalsIgnoreCase("offset")))
        .forEach(key -> {

          Optional<String> value = this.queryParameters.get(key).stream().findFirst();

          if (value.isPresent()) {
            try {
              if (!query.toString().isEmpty()) {
                query.append(" AND ").append(getConditionalJSONBQuery(key, value.get()));
              } else {
                query.append(getConditionalJSONBQuery(key, value.get()));
              }
            } catch (ParseException exception) {
              LOGGER.warn("Ignoring query where clause", exception);
            }
          }


        });

    return query.toString().isEmpty() ? "" : " WHERE " + query;
  }


  private String getConditionalJSONBQuery(String key, String value) throws ParseException {

    return " CASE jsonb_typeof(data->'" + key + "')" +
        " WHEN 'number' THEN (data->>'" + key + "') = '" + value + "'" +
        " WHEN 'string' THEN data->>'" + key + "'" + " LIKE '%" + value + "%'" +
        " WHEN 'boolean' THEN (data->>'" + key + "') = '" + value + "'" +
        " END";
  }

}

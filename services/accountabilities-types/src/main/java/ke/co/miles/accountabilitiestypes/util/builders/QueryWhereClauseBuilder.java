/*
 * Copyright (C) 2021 Second Mile
 *
 * This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0.
 * If a copy of the MPL was not distributed with this file,
 * You can obtain one at http://mozilla.org/MPL/2.0/.
 */
package ke.co.miles.accountabilitiestypes.util.builders;

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

  private MultiValueMap<String, String> queryParameters;

  private static final Logger LOGGER = LoggerFactory.getLogger(QueryWhereClauseBuilder.class);

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

    // Other (hierarchy,commissioner,responsible)
    this.queryParameters
        .keySet()
        .stream()
        .filter(key -> !(key.equalsIgnoreCase("ids")) &&
            !(key.equalsIgnoreCase("limit")) &&
            !(key.equalsIgnoreCase("offset")))
        .forEach(key -> {

          Optional<String> value = this.queryParameters.get(key).stream().findFirst();

          if (value.isPresent()) {
            if (!query.toString().isEmpty()) {
              query.append(" AND ").append(getQueryFragment(key, value.get()));
            } else {
              query.append(getQueryFragment(key, value.get()));
            }
          }
        });

    return query.toString().isEmpty() ? "" : " WHERE " + query;
  }

  public String buildForLevelOnly() {

    final StringBuilder query = new StringBuilder();

    // Other (hierarchy,commissioner,responsible)
    this.queryParameters
        .keySet()
        .stream()
        .filter(key -> (key.equalsIgnoreCase("level")) ||
            (key.equalsIgnoreCase("leveLT")) ||
            (key.equalsIgnoreCase("leveLTE")) ||
            (key.equalsIgnoreCase("levelGT")) ||
            (key.equalsIgnoreCase("levelGTE")))
        .forEach(key -> {

          Optional<String> value = this.queryParameters.get(key).stream().findFirst();

          if (value.isPresent()) {
            if (!query.toString().isEmpty()) {
              query.append(" AND ").append(getQueryFragment(key, value.get()));
            } else {
              query.append(getQueryFragment(key, value.get()));
            }
          }
        });

    return query.toString().isEmpty() ? "" : " WHERE " + query + " ";
  }

  private String getQueryFragment(String key, String value) {

    switch (key) {
      case "hierarchyId":
        return "data -> 'hierarchy' ->> 'id' = '" + value + "'";
      case "commissionerId":
        return "data -> 'commissioner' ->> 'id' = '" + value + "'";
      case "responsibleId":
        return "data -> 'responsible' ->> 'id' = '" + value + "'";
      case "levelLT":
        return "level < " + value;
      case "levelLTE":
        return "level <= " + value;
      case "levelGT":
        return "level > " + value;
      case "levelGTE":
        return "level >= " + value;
      default:
        return key + " = " + value;
    }

  }


}

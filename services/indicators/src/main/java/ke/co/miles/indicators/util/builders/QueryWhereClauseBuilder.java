/*
 * Copyright (C) 2021 Second Mile
 *
 * This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0.
 * If a copy of the MPL was not distributed with this file,
 * You can obtain one at http://mozilla.org/MPL/2.0/.
 */
package ke.co.miles.indicators.util.builders;

import java.util.Optional;
import java.util.regex.Pattern;
import org.springframework.util.MultiValueMap;

/**
 * @author Kwaje Anthony <tony@miles.co.ke>
 * @version 1.0
 * @since 0.0.1
 */
public class QueryWhereClauseBuilder {

  private MultiValueMap<String, String> queryParameters;

  public QueryWhereClauseBuilder queryParameters(MultiValueMap<String, String> queryParameters) {
    this.queryParameters = queryParameters;
    return this;
  }

  public String build() {

    final StringBuilder query = new StringBuilder();

    this.queryParameters
        .keySet()
        .stream()
        .filter(key -> !(key.equalsIgnoreCase("_page")) &&
            !(key.equalsIgnoreCase("_limit")) &&
            !(key.equalsIgnoreCase("_sort")) &&
            !(key.equalsIgnoreCase("_order")))
        .forEach(key -> {

          Optional<String> value = this.queryParameters.get(key).stream().findFirst();

          if (value.isPresent()) {

            String dataQueryFragment = getDataElementQueryFragment(key, value.get());

            if (dataQueryFragment != null) {

              if (!query.toString().isEmpty()) {

                query.append(" AND ").append(dataQueryFragment);

              } else {

                query.append(dataQueryFragment);

              }

            }

          }
        });

    return query.toString().isEmpty() ? "" : " WHERE " + query;

  }


  /**
   * See: http://raph.site/blog/postgresql.html
   */
  private String getDataElementQueryFragment(String key, String value) {

    String attr;
    String op;
    String query;

    if (key.contains("_")) {

      if (key.endsWith("_like")) {
        attr = key.substring(0, key.indexOf("_like"));
        op = "LIKE";
      } else if (key.endsWith("_lt")) {
        attr = key.substring(0, key.indexOf("_lt"));
        op = "LT";
      } else if (key.endsWith("_lte")) {
        attr = key.substring(0, key.indexOf("_lte"));
        op = "LTE";
      } else if (key.endsWith("_gt")) {
        attr = key.substring(0, key.indexOf("_gt"));
        op = "GT";
      } else if (key.endsWith("_gte")) {
        attr = key.substring(0, key.indexOf("_gte"));
        op = "GTE";
      } else {
        attr = key;
        op = "EQ";
      }

    } else {
      attr = key;
      op = "EQ";
    }

    String prefix = attr.contains(".")? "data -> " : "data ->> ";

    switch (op) {

      case "EQ":
        query = (attr.equalsIgnoreCase("id") || attr.equalsIgnoreCase("version")) ?
            (attr + " = " + value)
            : (prefix + getResolvedAttribute(attr) + " = '" + value + "'");
        break;
      case "LIKE":
        query = (attr.equalsIgnoreCase("id") || attr.equalsIgnoreCase("version")) ?
            null : (prefix + getResolvedAttribute(attr) + "" + " LIKE '%" + value + "%'");
        break;
      case "LT":
        query = (attr.equalsIgnoreCase("id") || attr.equalsIgnoreCase("version")) ?
            (attr + " < " + value)
            : (prefix + getResolvedAttribute(attr) + " < '" + value + "'");
        break;
      case "LTE":
        query = (attr.equalsIgnoreCase("id") || attr.equalsIgnoreCase("version")) ?
            (attr + " <= " + value)
            : (prefix + getResolvedAttribute(attr) + " <= '" + value + "'");
        break;
      case "GT":
        query = (attr.equalsIgnoreCase("id") || attr.equalsIgnoreCase("version")) ?
            (attr + " > " + value)
            : (prefix + getResolvedAttribute(attr) + " > '" + value + "'");
        break;
      case "GTE":
        query = (attr.equalsIgnoreCase("id") || attr.equalsIgnoreCase("version")) ?
            (attr + " >= " + value)
            : (prefix + getResolvedAttribute(attr) + " >= '" + value + "'");
        break;
      default:
        query = null;

    }

    System.err.println(query);
    return query;


  }

  private String getResolvedAttribute(String attr) {

    if (attr.contains(".")) {

      String resolved = "";
      for (String s : attr.split("\\.")) {
        if(s.length() > 0) {
          if (resolved.length() > 0) {
            resolved = resolved.concat(" ->> ");
          }
          resolved = resolved.concat("'" + s + "'");
        }
      }
      return resolved;
      
    } else {
      return "'" + attr + "'";
    }
  }

}
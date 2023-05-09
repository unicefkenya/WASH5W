/*
 * Copyright (C) 2021 Second Mile
 *
 * This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0.
 * If a copy of the MPL was not distributed with this file,
 * You can obtain one at http://mozilla.org/MPL/2.0/.
 */
package ke.co.miles.workflows.util.builders;

import org.springframework.util.MultiValueMap;

/**
 * @author Kwaje Anthony <tony@miles.co.ke>
 * @version 1.0
 * @since 0.0.1
 */
public class QuerySortClauseBuilder {

  private String sortField;
  private String orderCriteria;

  public QuerySortClauseBuilder queryParameters(MultiValueMap<String, String> queryParameters) {

    // Read and set the sort by value
    this.sortField = this.getSortField(queryParameters);

    // Read and set the order criteria value
    this.orderCriteria = this.getOrderCriteria(queryParameters);

    return this;
  }

  private String getSortField(MultiValueMap<String, String> queryParameters) {

    return
        queryParameters.get("_sort") == null ? null :
            queryParameters
                .get("_sort")
                .stream()
                .findFirst()
                .orElse(null);

  }

  private String getOrderCriteria(MultiValueMap<String, String> queryParameters) {

    String order =
        queryParameters.get("_order") == null ? null :
            queryParameters
                .get("_order")
                .stream()
                .findFirst()
                .orElse(null);

    return order == null ? "ASC"
        : ((order.equals("ASC") || order.equals("DESC")) ? "ASC" : order.toLowerCase());

  }

  public String build() {

    StringBuilder query = new StringBuilder();

    // Sort Field
    if (this.sortField != null) {

      if(sortField.equalsIgnoreCase("id") || sortField.equalsIgnoreCase("version")) {
        query.append(" ORDER BY ").append(sortField);
      } else {
        query.append(" ORDER BY data ->> '").append(sortField).append("'");
      }

      query.append(" ").append(orderCriteria);

    }

    return query.toString();

  }

}

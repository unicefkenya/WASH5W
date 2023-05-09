/*
 * Copyright (C) 2021 Second Mile
 *
 * This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0.
 * If a copy of the MPL was not distributed with this file,
 * You can obtain one at http://mozilla.org/MPL/2.0/.
 */
package ke.co.miles.accountabilitiestypes.util.builders;

import org.springframework.util.MultiValueMap;

/**
 * @author Kwaje Anthony <tony@miles.co.ke>
 * @version 1.0
 * @since 0.0.1
 */
public class QueryPaginationClauseBuilder {

  private Integer limit;
  private Integer offset;

  public QueryPaginationClauseBuilder queryParameters(
      MultiValueMap<String, String> queryParameters) {

    // Read and set the limit value
    this.limit =
        queryParameters.get("limit") == null ? null :
            queryParameters
                .get("limit")
                .stream()
                .findFirst()
                .map(Integer::parseInt)
                .orElse(null);

    // Read and set the offset value
    this.offset =
        queryParameters.get("offset") == null ? null :
            queryParameters
                .get("offset")
                .stream()
                .findFirst()
                .map(Integer::parseInt)
                .orElse(null);

    return this;
  }

  public String build() {

    StringBuilder query = new StringBuilder();

    // Limit
    if (this.limit != null) {
      query.append(this.limit <= 0 ? "" : " LIMIT " + this.limit);
    }

    // Offset
    if (this.offset != null) {
      query.append(this.offset <= 0 ? "" : " OFFSET " + this.offset);
    }

    return query.toString();
  }
}

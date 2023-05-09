/*
 * Copyright (C) 2021 Second Mile
 *
 * This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0.
 * If a copy of the MPL was not distributed with this file,
 * You can obtain one at http://mozilla.org/MPL/2.0/.
 */
package ke.co.miles.dataformselementstypes.util.builders;

import org.springframework.util.MultiValueMap;

/**
 * @author Kwaje Anthony <tony@miles.co.ke>
 * @version 1.0
 * @since 0.0.1
 */
public class QueryPaginationClauseBuilder {

  private Integer page;
  private Integer limit;
  private Integer offset;


  public QueryPaginationClauseBuilder queryParameters(
      MultiValueMap<String, String> queryParameters) {

    // Read and set the page value
    this.page = this.getPage(queryParameters);

    // Read and set the limit value
    this.limit = this.getLimit(queryParameters);

    // Calculate and set the offset
    this.offset = (this.page == null || this.limit == null) ? null : (page - 1) * limit;

    return this;
  }

  private Integer getPage(MultiValueMap<String, String> queryParameters) {

    Integer page =
        queryParameters.get("_page") == null ? null :
            queryParameters
                .get("_page")
                .stream()
                .findFirst()
                .map(Integer::parseInt)
                .orElse(null);

    return page == null ? null : (page < 1 ? 1 : page);

  }

  private Integer getLimit(MultiValueMap<String, String> queryParameters) {

    Integer limit =
        queryParameters.get("_limit") == null ? null :
            queryParameters
                .get("_limit")
                .stream()
                .findFirst()
                .map(Integer::parseInt)
                .orElse(null);

    return limit == null ? null : (limit < 1 ? 20 : limit);

  }

  public String build() {

    StringBuilder query = new StringBuilder();

    // Limit
    if (this.limit != null) {
      query.append(" LIMIT ").append(this.limit);
    }

    // Offset
    if (this.offset != null) {
      query.append(" OFFSET ").append(this.offset);
    }

    return query.toString();

  }

}

/*
 * Copyright (C) 2021 Second Mile
 *
 * This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0.
 * If a copy of the MPL was not distributed with this file,
 * You can obtain one at http://mozilla.org/MPL/2.0/.
 */
package ke.co.miles.logicalhierarchies.repository.selection;

import ke.co.miles.logicalhierarchies.configurations.DatabaseConfig;
import ke.co.miles.logicalhierarchies.models.LogicalHierarchy;
import ke.co.miles.logicalhierarchies.util.builders.LogicalHierarchyBuilder;
import ke.co.miles.logicalhierarchies.util.builders.QueryPaginationClauseBuilder;
import ke.co.miles.logicalhierarchies.util.builders.QueryWhereClauseBuilder;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;
import org.springframework.util.MultiValueMap;
import reactor.core.publisher.Flux;

/**
 * @author Kwaje Anthony <tony@miles.co.ke>
 * @version 1.0
 * @since 1.0
 */
@Component
@Slf4j
public class SelectLogicalHierarchiesQuery {

  @Autowired
  DatabaseConfig databaseConfig;

  /**
   * Selects all or specific logicalHierarchies records from the database depending on whether query
   * parameters were supplied as part of the query
   *
   * @param parameters the query parameters passed along with the request
   * @return a list of logicalHierarchies records if found
   */
  public Flux<LogicalHierarchy> selectLogicalHierarchies(MultiValueMap<String, String> parameters) {

    log.trace("Entering selectLogicalHierarchies()");

    String query =
        "SELECT * FROM logical_hierarchy" +
            new QueryWhereClauseBuilder().queryParameters(parameters).build() +
            " ORDER BY id ASC" +
            new QueryPaginationClauseBuilder().queryParameters(parameters).build();

    return
        Flux.from(
            databaseConfig
                .getDatabase()
                .select(query)
                .get(rs ->
                    new LogicalHierarchyBuilder()
                        .id(rs.getLong("id"))
                        .data(rs.getString("data"))
                        .version(rs.getInt("version"))
                        .build()));
  }

}

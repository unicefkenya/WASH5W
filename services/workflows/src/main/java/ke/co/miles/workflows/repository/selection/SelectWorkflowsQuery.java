/*
 * Copyright (C) 2021 Second Mile
 *
 * This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0.
 * If a copy of the MPL was not distributed with this file,
 * You can obtain one at http://mozilla.org/MPL/2.0/.
 */
package ke.co.miles.workflows.repository.selection;

import ke.co.miles.workflows.configurations.DatabaseConfig;
import ke.co.miles.workflows.models.Workflow;
import ke.co.miles.workflows.util.builders.WorkflowBuilder;
import ke.co.miles.workflows.util.builders.QueryPaginationClauseBuilder;
import ke.co.miles.workflows.util.builders.QueryWhereClauseBuilder;
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
public class SelectWorkflowsQuery {

  @Autowired
  DatabaseConfig databaseConfig;

  /**
   * Selects all or specific workflows records from the database depending on whether query
   * parameters were supplied as part of the query
   *
   * @param parameters the query parameters passed along with the request
   * @return a list of workflows records if found
   */
  public Flux<Workflow> selectWorkflows(MultiValueMap<String, String> parameters) {

    log.trace("Entering selectWorkflows()");

    String query =
        "SELECT * FROM workflow" +
            new QueryWhereClauseBuilder().queryParameters(parameters).build() +
            " ORDER BY id ASC" +
            new QueryPaginationClauseBuilder().queryParameters(parameters).build();

    return
        Flux.from(
            databaseConfig
                .getDatabase()
                .select(query)
                .get(rs ->
                    new WorkflowBuilder()
                        .id(rs.getLong("id"))
                        .data(rs.getString("data"))
                        .version(rs.getInt("version"))
                        .build()));
  }

}

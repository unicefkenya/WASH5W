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
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;
import reactor.core.publisher.Mono;

/**
 * @author Kwaje Anthony <tony@miles.co.ke>
 * @version 1.0
 * @since 1.0
 */
@Component
@Slf4j
public class SelectWorkflowQuery {

  @Autowired
  DatabaseConfig databaseConfig;

  /**
   * Selects a workflow record from the database given its unique identifier
   *
   * @param id the unique identifier of the workflow record to be selected
   * @return the workflow record with the given id if found
   */
  public Mono<Workflow> selectWorkflow(Long id) {

    log.trace("Entering selectWorkflow()");

    String query = "SELECT * FROM workflow WHERE id = ?";

    return
        Mono.from(
            databaseConfig
                .getDatabase()
                .select(query)
                .parameters(id)
                .get(rs ->
                    new WorkflowBuilder()
                        .id(rs.getLong("id"))
                        .data(rs.getString("data"))
                        .version(rs.getInt("version"))
                        .build()));
  }

}

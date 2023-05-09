/*
 * Copyright (C) 2021 Second Mile
 *
 * This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0.
 * If a copy of the MPL was not distributed with this file,
 * You can obtain one at http://mozilla.org/MPL/2.0/.
 */
package ke.co.miles.workflowstatuses.repository.selection;

import ke.co.miles.workflowstatuses.configurations.DatabaseConfig;
import ke.co.miles.workflowstatuses.models.WorkflowStatus;
import ke.co.miles.workflowstatuses.util.builders.WorkflowStatusBuilder;
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
public class SelectWorkflowStatusQuery {

  @Autowired
  DatabaseConfig databaseConfig;

  /**
   * Selects a workflowStatus record from the database given its unique identifier
   *
   * @param id the unique identifier of the workflowStatus record to be selected
   * @return the workflowStatus record with the given id if found
   */
  public Mono<WorkflowStatus> selectWorkflowStatus(Long id) {

    log.trace("Entering selectWorkflowStatus()");

    String query = "SELECT * FROM workflow_status WHERE id = ?";

    return
        Mono.from(
            databaseConfig
                .getDatabase()
                .select(query)
                .parameters(id)
                .get(rs ->
                    new WorkflowStatusBuilder()
                        .id(rs.getLong("id"))
                        .data(rs.getString("data"))
                        .version(rs.getInt("version"))
                        .build()));
  }

}

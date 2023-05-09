/*
 * Copyright (C) 2021 Second Mile
 *
 * This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0.
 * If a copy of the MPL was not distributed with this file,
 * You can obtain one at http://mozilla.org/MPL/2.0/.
 */
package ke.co.miles.workflowstatuses.repository.updation;

import ke.co.miles.workflowstatuses.configurations.DatabaseConfig;
import ke.co.miles.workflowstatuses.models.WorkflowStatus;
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
public class UpdateWorkflowStatusQuery {

  @Autowired
  DatabaseConfig databaseConfig;

  /**
   * Updates a workflowStatus record
   *
   * @param workflowStatus   a bean containing the workflowStatus record details
   * @return the number of workflowStatuses records affected by the query i.e. updated
   */
  public Mono<Integer> updateWorkflowStatus(WorkflowStatus workflowStatus) {

    log.trace("Entering updateWorkflowStatus()");

    String query = "UPDATE workflow_status SET data = ?::jsonb WHERE id = ?";

    return
        Mono.from(
            databaseConfig
                .getDatabase()
                .update(query)
                .parameters(
                    workflowStatus.getData(),
                    workflowStatus.getId())
                .counts());
  }
}

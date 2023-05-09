/*
 * Copyright (C) 2021 Second Mile
 *
 * This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0.
 * If a copy of the MPL was not distributed with this file,
 * You can obtain one at http://mozilla.org/MPL/2.0/.
 */
package ke.co.miles.workflowstatuses.repository.insertion;

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
public class InsertWorkflowStatusQuery {

  @Autowired
  DatabaseConfig databaseConfig;

  /**
   * Inserts a new workflowStatus record into the database
   *
   * @param workflowStatus   a bean containing the workflowStatus record details
   * @return the unique identifier of the newly inserted workflowStatus record
   */
  public Mono<Long> insertWorkflowStatus(WorkflowStatus workflowStatus) {

    log.trace("Entering insertWorkflowStatus()");

    String query = "INSERT INTO workflow_status(data) VALUES(?::jsonb)";

    return
        Mono.from(
            databaseConfig
                .getDatabase()
                .update(query)
                .parameters(
                    workflowStatus.getData())
                .returnGeneratedKeys()
                .getAs(Long.class));
  }

}

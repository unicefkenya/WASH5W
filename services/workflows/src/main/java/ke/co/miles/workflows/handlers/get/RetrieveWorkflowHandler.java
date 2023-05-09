/*
 * Copyright (C) 2021 Second Mile
 *
 * This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0.
 * If a copy of the MPL was not distributed with this file,
 * You can obtain one at http://mozilla.org/MPL/2.0/.
 */
package ke.co.miles.workflows.handlers.get;

import ke.co.miles.workflows.exceptions.ServerException;
import ke.co.miles.workflows.models.Workflow;
import ke.co.miles.workflows.repository.WorkflowsRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.reactive.function.server.ServerRequest;
import org.springframework.web.reactive.function.server.ServerResponse;
import reactor.core.publisher.Mono;

/**
 * @author Kwaje Anthony <tony@miles.co.ke>
 * @version 1.0
 * @since 1.0
 */
@Component
@Slf4j
public class RetrieveWorkflowHandler {

  @Autowired
  WorkflowsRepository repository;

  /**
   * Retrieves a workflow record given its unique identifier
   *
   * @param request the request containing the unique identifier of the workflow record to be
   *                retrieved and the database from which it should be retrieved
   * @return the response containing the details of the retrieved workflow record
   */
  public Mono<ServerResponse> retrieveWorkflow(ServerRequest request) {

    log.trace("Entering retrieveWorkflow()");

    return
        ServerResponse
            .ok()
            .contentType(MediaType.APPLICATION_JSON)
            .body(
                repository
                    .selectWorkflow(Long.parseLong(request.pathVariable("id"))),
                Workflow.class)
            .onErrorMap(e -> new ServerException("Workflow deletion failed", e));

  }

}

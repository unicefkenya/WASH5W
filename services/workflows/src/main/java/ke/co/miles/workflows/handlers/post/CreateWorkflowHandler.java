/*
 * Copyright (C) 2021 Second Mile
 *
 * This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0.
 * If a copy of the MPL was not distributed with this file,
 * You can obtain one at http://mozilla.org/MPL/2.0/.
 */
package ke.co.miles.workflows.handlers.post;

import ke.co.miles.workflows.exceptions.ServerException;
import ke.co.miles.workflows.models.Workflow;
import ke.co.miles.workflows.repository.WorkflowsRepository;
import ke.co.miles.workflows.util.builders.WorkflowBuilder;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
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
public class CreateWorkflowHandler {

  @Autowired
  WorkflowsRepository repository;

  /**
   * Creates a workflow record
   *
   * @param request the request containing the details of the workflow record to be created and the
   *                database within which it should be created
   * @return the response containing the details of the newly created workflow record
   */
  public Mono<ServerResponse> createWorkflow(ServerRequest request) {

    log.trace("Entering createWorkflow()");

    return
        ServerResponse
            .status(HttpStatus.CREATED)
            .contentType(MediaType.APPLICATION_JSON)
            .body(
                request
                    .bodyToMono(Workflow.class)
                    .flatMap(workflow ->
                        repository
                            .insertWorkflow(workflow)
                            .map(id ->
                                new WorkflowBuilder()
                                    .id(id)
                                    .data(workflow.getData())
                                    .version(1)
                                    .build())),
                Workflow.class)
            .onErrorMap(e -> new ServerException("Workflow creation failed", e));
  }


}

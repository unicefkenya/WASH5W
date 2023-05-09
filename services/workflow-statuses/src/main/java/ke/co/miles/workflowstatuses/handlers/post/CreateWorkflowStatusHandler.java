/*
 * Copyright (C) 2021 Second Mile
 *
 * This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0.
 * If a copy of the MPL was not distributed with this file,
 * You can obtain one at http://mozilla.org/MPL/2.0/.
 */
package ke.co.miles.workflowstatuses.handlers.post;

import ke.co.miles.workflowstatuses.exceptions.ServerException;
import ke.co.miles.workflowstatuses.models.WorkflowStatus;
import ke.co.miles.workflowstatuses.repository.WorkflowStatusesRepository;
import ke.co.miles.workflowstatuses.util.builders.WorkflowStatusBuilder;
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
public class CreateWorkflowStatusHandler {

  @Autowired
  WorkflowStatusesRepository repository;

  /**
   * Creates a workflowStatus record
   *
   * @param request the request containing the details of the workflowStatus record to be created and the
   *                database within which it should be created
   * @return the response containing the details of the newly created workflowStatus record
   */
  public Mono<ServerResponse> createWorkflowStatus(ServerRequest request) {

    log.trace("Entering createWorkflowStatus()");

    return
        ServerResponse
            .status(HttpStatus.CREATED)
            .contentType(MediaType.APPLICATION_JSON)
            .body(
                request
                    .bodyToMono(WorkflowStatus.class)
                    .flatMap(workflowStatus ->
                        repository
                            .insertWorkflowStatus(workflowStatus)
                            .map(id ->
                                new WorkflowStatusBuilder()
                                    .id(id)
                                    .data(workflowStatus.getData())
                                    .version(1)
                                    .build())),
                WorkflowStatus.class)
            .onErrorMap(e -> new ServerException("WorkflowStatus creation failed", e));
  }


}

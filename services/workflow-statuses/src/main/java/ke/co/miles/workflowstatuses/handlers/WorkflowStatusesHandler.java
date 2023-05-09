/*
 * Copyright (C) 2021 Second Mile
 *
 * This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0.
 * If a copy of the MPL was not distributed with this file,
 * You can obtain one at http://mozilla.org/MPL/2.0/.
 */
package ke.co.miles.workflowstatuses.handlers;

import ke.co.miles.workflowstatuses.handlers.delete.DeleteWorkflowStatusHandler;
import ke.co.miles.workflowstatuses.handlers.get.RetrieveWorkflowStatusHandler;
import ke.co.miles.workflowstatuses.handlers.get.RetrieveWorkflowStatusesHandler;
import ke.co.miles.workflowstatuses.handlers.post.CreateWorkflowStatusHandler;
import ke.co.miles.workflowstatuses.handlers.put.UpdateWorkflowStatusHandler;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
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
public class WorkflowStatusesHandler {

  // POST HANDLERS
  @Autowired
  CreateWorkflowStatusHandler createWorkflowStatusHandler;

  // GET HANDLERS
  @Autowired
  RetrieveWorkflowStatusHandler retrieveWorkflowStatusByIdHandler;

  @Autowired
  RetrieveWorkflowStatusesHandler retrieveWorkflowStatusesHandler;

  // PUT HANDLERS
  @Autowired
  UpdateWorkflowStatusHandler updateWorkflowStatusHandler;

  // DELETE HANDLERS
  @Autowired
  DeleteWorkflowStatusHandler deleteWorkflowStatusByIdHandler;


  // <editor-fold desc="POST">
  public Mono<ServerResponse> createWorkflowStatus(ServerRequest request) {
    return this.createWorkflowStatusHandler.createWorkflowStatus(request);
  }

  // </editor-fold>

  // <editor-fold desc="GET">

  public Mono<ServerResponse> retrieveWorkflowStatus(ServerRequest request) {
    return this.retrieveWorkflowStatusByIdHandler.retrieveWorkflowStatus(request);
  }

  public Mono<ServerResponse> retrieveWorkflowStatuses(ServerRequest request) {
    return this.retrieveWorkflowStatusesHandler.retrieveWorkflowStatuses(request);
  }

  // </editor-fold>

  // <editor-fold desc="PUT">
  public Mono<ServerResponse> updateWorkflowStatus(ServerRequest request) {
    return this.updateWorkflowStatusHandler.updateWorkflowStatus(request);
  }

  // </editor-fold>

  // <editor-fold desc="DELETE">
  public Mono<ServerResponse> deleteWorkflowStatus(ServerRequest request) {
    return this.deleteWorkflowStatusByIdHandler.deleteWorkflowStatus(request);
  }

  // </editor-fold>

}

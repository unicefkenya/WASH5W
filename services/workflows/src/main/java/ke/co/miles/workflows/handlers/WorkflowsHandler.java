/*
 * Copyright (C) 2021 Second Mile
 *
 * This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0.
 * If a copy of the MPL was not distributed with this file,
 * You can obtain one at http://mozilla.org/MPL/2.0/.
 */
package ke.co.miles.workflows.handlers;

import ke.co.miles.workflows.handlers.delete.DeleteWorkflowHandler;
import ke.co.miles.workflows.handlers.get.RetrieveWorkflowsHandler;
import ke.co.miles.workflows.handlers.get.RetrieveWorkflowHandler;
import ke.co.miles.workflows.handlers.post.CreateWorkflowHandler;
import ke.co.miles.workflows.handlers.put.UpdateWorkflowHandler;
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
public class WorkflowsHandler {

  // POST HANDLERS
  @Autowired
  CreateWorkflowHandler createWorkflowHandler;

  // GET HANDLERS
  @Autowired
  RetrieveWorkflowHandler retrieveWorkflowByIdHandler;

  @Autowired
  RetrieveWorkflowsHandler retrieveWorkflowsHandler;

  // PUT HANDLERS
  @Autowired
  UpdateWorkflowHandler updateWorkflowHandler;

  // DELETE HANDLERS
  @Autowired
  DeleteWorkflowHandler deleteWorkflowByIdHandler;


  // <editor-fold desc="POST">
  public Mono<ServerResponse> createWorkflow(ServerRequest request) {
    return this.createWorkflowHandler.createWorkflow(request);
  }

  // </editor-fold>

  // <editor-fold desc="GET">

  public Mono<ServerResponse> retrieveWorkflow(ServerRequest request) {
    return this.retrieveWorkflowByIdHandler.retrieveWorkflow(request);
  }

  public Mono<ServerResponse> retrieveWorkflows(ServerRequest request) {
    return this.retrieveWorkflowsHandler.retrieveWorkflows(request);
  }

  // </editor-fold>

  // <editor-fold desc="PUT">
  public Mono<ServerResponse> updateWorkflow(ServerRequest request) {
    return this.updateWorkflowHandler.updateWorkflow(request);
  }

  // </editor-fold>

  // <editor-fold desc="DELETE">
  public Mono<ServerResponse> deleteWorkflow(ServerRequest request) {
    return this.deleteWorkflowByIdHandler.deleteWorkflow(request);
  }

  // </editor-fold>

}

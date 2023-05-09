/*
 * Copyright (C) 2021 Second Mile
 *
 * This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0.
 * If a copy of the MPL was not distributed with this file,
 * You can obtain one at http://mozilla.org/MPL/2.0/.
 */
package ke.co.miles.logicalhierarchies.handlers;

import ke.co.miles.logicalhierarchies.handlers.delete.DeleteLogicalHierarchyHandler;
import ke.co.miles.logicalhierarchies.handlers.get.RetrieveLogicalHierarchyHandler;
import ke.co.miles.logicalhierarchies.handlers.get.RetrieveLogicalHierarchiesHandler;
import ke.co.miles.logicalhierarchies.handlers.post.CreateLogicalHierarchyHandler;
import ke.co.miles.logicalhierarchies.handlers.put.UpdateLogicalHierarchyHandler;
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
public class LogicalHierarchiesHandler {

  // POST HANDLERS
  @Autowired
  CreateLogicalHierarchyHandler createLogicalHierarchyHandler;

  // GET HANDLERS
  @Autowired
  RetrieveLogicalHierarchyHandler retrieveLogicalHierarchyByIdHandler;

  @Autowired
  RetrieveLogicalHierarchiesHandler retrieveLogicalHierarchiesHandler;

  // PUT HANDLERS
  @Autowired
  UpdateLogicalHierarchyHandler updateLogicalHierarchyHandler;

  // DELETE HANDLERS
  @Autowired
  DeleteLogicalHierarchyHandler deleteLogicalHierarchyByIdHandler;


  // <editor-fold desc="POST">
  public Mono<ServerResponse> createLogicalHierarchy(ServerRequest request) {
    return this.createLogicalHierarchyHandler.createLogicalHierarchy(request);
  }

  // </editor-fold>

  // <editor-fold desc="GET">

  public Mono<ServerResponse> retrieveLogicalHierarchy(ServerRequest request) {
    return this.retrieveLogicalHierarchyByIdHandler.retrieveLogicalHierarchy(request);
  }

  public Mono<ServerResponse> retrieveLogicalHierarchies(ServerRequest request) {
    return this.retrieveLogicalHierarchiesHandler.retrieveLogicalHierarchies(request);
  }

  // </editor-fold>

  // <editor-fold desc="PUT">
  public Mono<ServerResponse> updateLogicalHierarchy(ServerRequest request) {
    return this.updateLogicalHierarchyHandler.updateLogicalHierarchy(request);
  }

  // </editor-fold>

  // <editor-fold desc="DELETE">
  public Mono<ServerResponse> deleteLogicalHierarchy(ServerRequest request) {
    return this.deleteLogicalHierarchyByIdHandler.deleteLogicalHierarchy(request);
  }

  // </editor-fold>

}

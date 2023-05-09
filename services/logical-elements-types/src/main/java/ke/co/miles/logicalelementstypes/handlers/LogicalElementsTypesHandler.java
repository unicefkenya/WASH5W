/*
 * Copyright (C) 2021 Second Mile
 *
 * This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0.
 * If a copy of the MPL was not distributed with this file,
 * You can obtain one at http://mozilla.org/MPL/2.0/.
 */
package ke.co.miles.logicalelementstypes.handlers;

import ke.co.miles.logicalelementstypes.handlers.delete.DeleteLogicalElementTypeHandler;
import ke.co.miles.logicalelementstypes.handlers.get.RetrieveLogicalElementTypeHandler;
import ke.co.miles.logicalelementstypes.handlers.get.RetrieveLogicalElementsTypesHandler;
import ke.co.miles.logicalelementstypes.handlers.post.CreateLogicalElementTypeHandler;
import ke.co.miles.logicalelementstypes.handlers.put.UpdateLogicalElementTypeHandler;
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
public class LogicalElementsTypesHandler {

  // POST HANDLERS
  @Autowired
  CreateLogicalElementTypeHandler createLogicalElementTypeHandler;

  // GET HANDLERS
  @Autowired
  RetrieveLogicalElementTypeHandler retrieveLogicalElementTypeByIdHandler;

  @Autowired
  RetrieveLogicalElementsTypesHandler retrieveLogicalElementsTypesHandler;

  // PUT HANDLERS
  @Autowired
  UpdateLogicalElementTypeHandler updateLogicalElementTypeHandler;

  // DELETE HANDLERS
  @Autowired
  DeleteLogicalElementTypeHandler deleteLogicalElementTypeByIdHandler;


  // <editor-fold desc="POST">
  public Mono<ServerResponse> createLogicalElementType(ServerRequest request) {
    return this.createLogicalElementTypeHandler.createLogicalElementType(request);
  }

  // </editor-fold>

  // <editor-fold desc="GET">

  public Mono<ServerResponse> retrieveLogicalElementType(ServerRequest request) {
    return this.retrieveLogicalElementTypeByIdHandler.retrieveLogicalElementType(request);
  }

  public Mono<ServerResponse> retrieveLogicalElementsTypes(ServerRequest request) {
    return this.retrieveLogicalElementsTypesHandler.retrieveLogicalElementsTypes(request);
  }

  // </editor-fold>

  // <editor-fold desc="PUT">
  public Mono<ServerResponse> updateLogicalElementType(ServerRequest request) {
    return this.updateLogicalElementTypeHandler.updateLogicalElementType(request);
  }

  // </editor-fold>

  // <editor-fold desc="DELETE">
  public Mono<ServerResponse> deleteLogicalElementType(ServerRequest request) {
    return this.deleteLogicalElementTypeByIdHandler.deleteLogicalElementType(request);
  }

  // </editor-fold>

}

/*
 * Copyright (C) 2021 Second Mile
 *
 * This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0.
 * If a copy of the MPL was not distributed with this file,
 * You can obtain one at http://mozilla.org/MPL/2.0/.
 */
package ke.co.miles.logicalelements.handlers;

import ke.co.miles.logicalelements.handlers.delete.DeleteLogicalElementHandler;
import ke.co.miles.logicalelements.handlers.get.RetrieveLogicalElementHandler;
import ke.co.miles.logicalelements.handlers.get.RetrieveLogicalElementsHandler;
import ke.co.miles.logicalelements.handlers.post.CreateLogicalElementHandler;
import ke.co.miles.logicalelements.handlers.put.UpdateLogicalElementHandler;
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
public class LogicalElementsHandler {

  // POST HANDLERS
  @Autowired
  CreateLogicalElementHandler createLogicalElementHandler;

  // GET HANDLERS
  @Autowired
  RetrieveLogicalElementHandler retrieveLogicalElementByIdHandler;

  @Autowired
  RetrieveLogicalElementsHandler retrieveLogicalElementsHandler;

  // PUT HANDLERS
  @Autowired
  UpdateLogicalElementHandler updateLogicalElementHandler;

  // DELETE HANDLERS
  @Autowired
  DeleteLogicalElementHandler deleteLogicalElementByIdHandler;


  // <editor-fold desc="POST">
  public Mono<ServerResponse> createLogicalElement(ServerRequest request) {
    return this.createLogicalElementHandler.createLogicalElement(request);
  }

  // </editor-fold>

  // <editor-fold desc="GET">

  public Mono<ServerResponse> retrieveLogicalElement(ServerRequest request) {
    return this.retrieveLogicalElementByIdHandler.retrieveLogicalElement(request);
  }

  public Mono<ServerResponse> retrieveLogicalElements(ServerRequest request) {
    return this.retrieveLogicalElementsHandler.retrieveLogicalElements(request);
  }

  // </editor-fold>

  // <editor-fold desc="PUT">
  public Mono<ServerResponse> updateLogicalElement(ServerRequest request) {
    return this.updateLogicalElementHandler.updateLogicalElement(request);
  }

  // </editor-fold>

  // <editor-fold desc="DELETE">
  public Mono<ServerResponse> deleteLogicalElement(ServerRequest request) {
    return this.deleteLogicalElementByIdHandler.deleteLogicalElement(request);
  }

  // </editor-fold>

}

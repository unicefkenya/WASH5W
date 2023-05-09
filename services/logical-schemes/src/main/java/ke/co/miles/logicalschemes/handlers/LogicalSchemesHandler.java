/*
 * Copyright (C) 2021 Second Mile
 *
 * This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0.
 * If a copy of the MPL was not distributed with this file,
 * You can obtain one at http://mozilla.org/MPL/2.0/.
 */
package ke.co.miles.logicalschemes.handlers;

import ke.co.miles.logicalschemes.handlers.delete.DeleteLogicalSchemeHandler;
import ke.co.miles.logicalschemes.handlers.get.RetrieveLogicalSchemeHandler;
import ke.co.miles.logicalschemes.handlers.get.RetrieveLogicalSchemesHandler;
import ke.co.miles.logicalschemes.handlers.post.CreateLogicalSchemeHandler;
import ke.co.miles.logicalschemes.handlers.put.UpdateLogicalSchemeHandler;
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
public class LogicalSchemesHandler {

  // POST HANDLERS
  @Autowired
  CreateLogicalSchemeHandler createLogicalSchemeHandler;

  // GET HANDLERS
  @Autowired
  RetrieveLogicalSchemeHandler retrieveLogicalSchemeByIdHandler;

  @Autowired
  RetrieveLogicalSchemesHandler retrieveLogicalSchemesHandler;

  // PUT HANDLERS
  @Autowired
  UpdateLogicalSchemeHandler updateLogicalSchemeHandler;

  // DELETE HANDLERS
  @Autowired
  DeleteLogicalSchemeHandler deleteLogicalSchemeByIdHandler;


  // <editor-fold desc="POST">
  public Mono<ServerResponse> createLogicalScheme(ServerRequest request) {
    return this.createLogicalSchemeHandler.createLogicalScheme(request);
  }

  // </editor-fold>

  // <editor-fold desc="GET">

  public Mono<ServerResponse> retrieveLogicalScheme(ServerRequest request) {
    return this.retrieveLogicalSchemeByIdHandler.retrieveLogicalScheme(request);
  }

  public Mono<ServerResponse> retrieveLogicalSchemes(ServerRequest request) {
    return this.retrieveLogicalSchemesHandler.retrieveLogicalSchemes(request);
  }

  // </editor-fold>

  // <editor-fold desc="PUT">
  public Mono<ServerResponse> updateLogicalScheme(ServerRequest request) {
    return this.updateLogicalSchemeHandler.updateLogicalScheme(request);
  }

  // </editor-fold>

  // <editor-fold desc="DELETE">
  public Mono<ServerResponse> deleteLogicalScheme(ServerRequest request) {
    return this.deleteLogicalSchemeByIdHandler.deleteLogicalScheme(request);
  }

  // </editor-fold>

}

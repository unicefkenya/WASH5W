/*
 * Copyright (C) 2021 Second Mile
 *
 * This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0.
 * If a copy of the MPL was not distributed with this file,
 * You can obtain one at http://mozilla.org/MPL/2.0/.
 */
package ke.co.miles.contexts.handlers;

import ke.co.miles.contexts.handlers.delete.DeleteContextHandler;
import ke.co.miles.contexts.handlers.get.RetrieveContextsHandler;
import ke.co.miles.contexts.handlers.get.RetrieveContextHandler;
import ke.co.miles.contexts.handlers.post.CreateContextHandler;
import ke.co.miles.contexts.handlers.put.UpdateContextHandler;
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
public class ContextsHandler {

  // POST HANDLERS
  @Autowired
  CreateContextHandler createContextHandler;

  // GET HANDLERS
  @Autowired
  RetrieveContextHandler retrieveContextByIdHandler;

  @Autowired
  RetrieveContextsHandler retrieveContextsHandler;

  // PUT HANDLERS
  @Autowired
  UpdateContextHandler updateContextHandler;

  // DELETE HANDLERS
  @Autowired
  DeleteContextHandler deleteContextByIdHandler;


  // <editor-fold desc="POST">
  public Mono<ServerResponse> createContext(ServerRequest request) {
    return this.createContextHandler.createContext(request);
  }

  // </editor-fold>

  // <editor-fold desc="GET">

  public Mono<ServerResponse> retrieveContext(ServerRequest request) {
    return this.retrieveContextByIdHandler.retrieveContext(request);
  }

  public Mono<ServerResponse> retrieveContexts(ServerRequest request) {
    return this.retrieveContextsHandler.retrieveContexts(request);
  }

  // </editor-fold>

  // <editor-fold desc="PUT">
  public Mono<ServerResponse> updateContext(ServerRequest request) {
    return this.updateContextHandler.updateContext(request);
  }

  // </editor-fold>

  // <editor-fold desc="DELETE">
  public Mono<ServerResponse> deleteContext(ServerRequest request) {
    return this.deleteContextByIdHandler.deleteContext(request);
  }

  // </editor-fold>

}

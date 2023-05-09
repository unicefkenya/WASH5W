/*
 * Copyright (C) 2021 Second Mile
 *
 * This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0.
 * If a copy of the MPL was not distributed with this file,
 * You can obtain one at http://mozilla.org/MPL/2.0/.
 */
package ke.co.miles.entities.handlers;

import ke.co.miles.entities.handlers.delete.DeleteEntityHandler;
import ke.co.miles.entities.handlers.get.RetrieveEntitiesHandler;
import ke.co.miles.entities.handlers.get.RetrieveEntityHandler;
import ke.co.miles.entities.handlers.post.CreateEntityHandler;
import ke.co.miles.entities.handlers.put.UpdateEntityHandler;
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
public class EntitiesHandler {

  // POST HANDLERS
  @Autowired
  CreateEntityHandler createEntityHandler;

  // GET HANDLERS
  @Autowired
  RetrieveEntityHandler retrieveEntityByIdHandler;

  @Autowired
  RetrieveEntitiesHandler retrieveEntitiesHandler;

  // PUT HANDLERS
  @Autowired
  UpdateEntityHandler updateEntityHandler;

  // DELETE HANDLERS
  @Autowired
  DeleteEntityHandler deleteEntityByIdHandler;


  // <editor-fold desc="POST">
  public Mono<ServerResponse> createEntity(ServerRequest request) {
    return this.createEntityHandler.createEntity(request);
  }

  // </editor-fold>

  // <editor-fold desc="GET">

  public Mono<ServerResponse> retrieveEntity(ServerRequest request) {
    return this.retrieveEntityByIdHandler.retrieveEntity(request);
  }

  public Mono<ServerResponse> retrieveEntities(ServerRequest request) {
    return this.retrieveEntitiesHandler.retrieveEntities(request);
  }

  // </editor-fold>

  // <editor-fold desc="PUT">
  public Mono<ServerResponse> updateEntity(ServerRequest request) {
    return this.updateEntityHandler.updateEntity(request);
  }

  // </editor-fold>

  // <editor-fold desc="DELETE">
  public Mono<ServerResponse> deleteEntity(ServerRequest request) {
    return this.deleteEntityByIdHandler.deleteEntity(request);
  }

  // </editor-fold>

}

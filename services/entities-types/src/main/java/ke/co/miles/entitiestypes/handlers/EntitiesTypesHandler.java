/*
 * Copyright (C) 2021 Second Mile
 *
 * This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0.
 * If a copy of the MPL was not distributed with this file,
 * You can obtain one at http://mozilla.org/MPL/2.0/.
 */
package ke.co.miles.entitiestypes.handlers;

import ke.co.miles.entitiestypes.handlers.delete.DeleteEntityTypeHandler;
import ke.co.miles.entitiestypes.handlers.get.RetrieveEntityTypeHandler;
import ke.co.miles.entitiestypes.handlers.get.RetrieveEntitiesTypesHandler;
import ke.co.miles.entitiestypes.handlers.post.CreateEntityTypeHandler;
import ke.co.miles.entitiestypes.handlers.put.UpdateEntityTypeHandler;
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
public class EntitiesTypesHandler {

  // POST HANDLERS
  @Autowired
  CreateEntityTypeHandler createEntityTypeHandler;

  // GET HANDLERS
  @Autowired
  RetrieveEntityTypeHandler retrieveEntityTypeByIdHandler;

  @Autowired
  RetrieveEntitiesTypesHandler retrieveEntitiesTypesHandler;

  // PUT HANDLERS
  @Autowired
  UpdateEntityTypeHandler updateEntityTypeHandler;

  // DELETE HANDLERS
  @Autowired
  DeleteEntityTypeHandler deleteEntityTypeByIdHandler;


  // <editor-fold desc="POST">
  public Mono<ServerResponse> createEntityType(ServerRequest request) {
    return this.createEntityTypeHandler.createEntityType(request);
  }

  // </editor-fold>

  // <editor-fold desc="GET">

  public Mono<ServerResponse> retrieveEntityType(ServerRequest request) {
    return this.retrieveEntityTypeByIdHandler.retrieveEntityType(request);
  }

  public Mono<ServerResponse> retrieveEntitiesTypes(ServerRequest request) {
    return this.retrieveEntitiesTypesHandler.retrieveEntitiesTypes(request);
  }

  // </editor-fold>

  // <editor-fold desc="PUT">
  public Mono<ServerResponse> updateEntityType(ServerRequest request) {
    return this.updateEntityTypeHandler.updateEntityType(request);
  }

  // </editor-fold>

  // <editor-fold desc="DELETE">
  public Mono<ServerResponse> deleteEntityType(ServerRequest request) {
    return this.deleteEntityTypeByIdHandler.deleteEntityType(request);
  }

  // </editor-fold>

}

/*
 * Copyright (C) 2021 Second Mile
 *
 * This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0.
 * If a copy of the MPL was not distributed with this file,
 * You can obtain one at http://mozilla.org/MPL/2.0/.
 */
package ke.co.miles.dissagregations.handlers;

import ke.co.miles.dissagregations.handlers.delete.DeleteDissagregationHandler;
import ke.co.miles.dissagregations.handlers.get.RetrieveDissagregationsHandler;
import ke.co.miles.dissagregations.handlers.get.RetrieveDissagregationHandler;
import ke.co.miles.dissagregations.handlers.post.CreateDissagregationHandler;
import ke.co.miles.dissagregations.handlers.put.UpdateDissagregationHandler;
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
public class DissagregationsHandler {

  // POST HANDLERS
  @Autowired
  CreateDissagregationHandler createDissagregationHandler;

  // GET HANDLERS
  @Autowired
  RetrieveDissagregationHandler retrieveDissagregationByIdHandler;

  @Autowired
  RetrieveDissagregationsHandler retrieveDissagregationsHandler;

  // PUT HANDLERS
  @Autowired
  UpdateDissagregationHandler updateDissagregationHandler;

  // DELETE HANDLERS
  @Autowired
  DeleteDissagregationHandler deleteDissagregationByIdHandler;


  // <editor-fold desc="POST">
  public Mono<ServerResponse> createDissagregation(ServerRequest request) {
    return this.createDissagregationHandler.createDissagregation(request);
  }

  // </editor-fold>

  // <editor-fold desc="GET">

  public Mono<ServerResponse> retrieveDissagregation(ServerRequest request) {
    return this.retrieveDissagregationByIdHandler.retrieveDissagregation(request);
  }

  public Mono<ServerResponse> retrieveDissagregations(ServerRequest request) {
    return this.retrieveDissagregationsHandler.retrieveDissagregations(request);
  }

  // </editor-fold>

  // <editor-fold desc="PUT">
  public Mono<ServerResponse> updateDissagregation(ServerRequest request) {
    return this.updateDissagregationHandler.updateDissagregation(request);
  }

  // </editor-fold>

  // <editor-fold desc="DELETE">
  public Mono<ServerResponse> deleteDissagregation(ServerRequest request) {
    return this.deleteDissagregationByIdHandler.deleteDissagregation(request);
  }

  // </editor-fold>

}

/*
 * Copyright (C) 2021 Second Mile
 *
 * This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0.
 * If a copy of the MPL was not distributed with this file,
 * You can obtain one at http://mozilla.org/MPL/2.0/.
 */
package ke.co.miles.dissagregationsschemes.handlers;

import ke.co.miles.dissagregationsschemes.handlers.delete.DeleteDissagregationSchemeHandler;
import ke.co.miles.dissagregationsschemes.handlers.get.RetrieveDissagregationSchemeHandler;
import ke.co.miles.dissagregationsschemes.handlers.get.RetrieveDissagregationsSchemesHandler;
import ke.co.miles.dissagregationsschemes.handlers.post.CreateDissagregationSchemeHandler;
import ke.co.miles.dissagregationsschemes.handlers.put.UpdateDissagregationSchemeHandler;
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
public class DissagregationsSchemesHandler {

  // POST HANDLERS
  @Autowired
  CreateDissagregationSchemeHandler createDissagregationSchemeHandler;

  // GET HANDLERS
  @Autowired
  RetrieveDissagregationSchemeHandler retrieveDissagregationSchemeByIdHandler;

  @Autowired
  RetrieveDissagregationsSchemesHandler retrieveDissagregationsSchemesHandler;

  // PUT HANDLERS
  @Autowired
  UpdateDissagregationSchemeHandler updateDissagregationSchemeHandler;

  // DELETE HANDLERS
  @Autowired
  DeleteDissagregationSchemeHandler deleteDissagregationSchemeByIdHandler;


  // <editor-fold desc="POST">
  public Mono<ServerResponse> createDissagregationScheme(ServerRequest request) {
    return this.createDissagregationSchemeHandler.createDissagregationScheme(request);
  }

  // </editor-fold>

  // <editor-fold desc="GET">

  public Mono<ServerResponse> retrieveDissagregationScheme(ServerRequest request) {
    return this.retrieveDissagregationSchemeByIdHandler.retrieveDissagregationScheme(request);
  }

  public Mono<ServerResponse> retrieveDissagregationsSchemes(ServerRequest request) {
    return this.retrieveDissagregationsSchemesHandler.retrieveDissagregationsSchemes(request);
  }

  // </editor-fold>

  // <editor-fold desc="PUT">
  public Mono<ServerResponse> updateDissagregationScheme(ServerRequest request) {
    return this.updateDissagregationSchemeHandler.updateDissagregationScheme(request);
  }

  // </editor-fold>

  // <editor-fold desc="DELETE">
  public Mono<ServerResponse> deleteDissagregationScheme(ServerRequest request) {
    return this.deleteDissagregationSchemeByIdHandler.deleteDissagregationScheme(request);
  }

  // </editor-fold>

}

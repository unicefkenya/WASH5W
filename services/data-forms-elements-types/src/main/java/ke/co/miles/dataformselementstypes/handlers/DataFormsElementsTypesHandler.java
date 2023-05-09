/*
 * Copyright (C) 2021 Second Mile
 *
 * This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0.
 * If a copy of the MPL was not distributed with this file,
 * You can obtain one at http://mozilla.org/MPL/2.0/.
 */
package ke.co.miles.dataformselementstypes.handlers;

import ke.co.miles.dataformselementstypes.handlers.delete.DeleteDataFormElementTypeHandler;
import ke.co.miles.dataformselementstypes.handlers.get.RetrieveDataFormElementTypeHandler;
import ke.co.miles.dataformselementstypes.handlers.get.RetrieveDataFormsElementsTypesHandler;
import ke.co.miles.dataformselementstypes.handlers.post.CreateDataFormElementTypeHandler;
import ke.co.miles.dataformselementstypes.handlers.put.UpdateDataFormElementTypeHandler;
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
public class DataFormsElementsTypesHandler {

  // POST HANDLERS
  @Autowired
  CreateDataFormElementTypeHandler createDataFormElementTypeHandler;

  // GET HANDLERS
  @Autowired
  RetrieveDataFormElementTypeHandler retrieveDataFormElementTypeByIdHandler;

  @Autowired
  RetrieveDataFormsElementsTypesHandler retrieveDataFormsElementsTypesHandler;

  // PUT HANDLERS
  @Autowired
  UpdateDataFormElementTypeHandler updateDataFormElementTypeHandler;

  // DELETE HANDLERS
  @Autowired
  DeleteDataFormElementTypeHandler deleteDataFormElementTypeByIdHandler;


  // <editor-fold desc="POST">
  public Mono<ServerResponse> createDataFormElementType(ServerRequest request) {
    return this.createDataFormElementTypeHandler.createDataFormElementType(request);
  }

  // </editor-fold>

  // <editor-fold desc="GET">

  public Mono<ServerResponse> retrieveDataFormElementType(ServerRequest request) {
    return this.retrieveDataFormElementTypeByIdHandler.retrieveDataFormElementType(request);
  }

  public Mono<ServerResponse> retrieveDataFormsElementsTypes(ServerRequest request) {
    return this.retrieveDataFormsElementsTypesHandler.retrieveDataFormsElementsTypes(request);
  }

  // </editor-fold>

  // <editor-fold desc="PUT">
  public Mono<ServerResponse> updateDataFormElementType(ServerRequest request) {
    return this.updateDataFormElementTypeHandler.updateDataFormElementType(request);
  }

  // </editor-fold>

  // <editor-fold desc="DELETE">
  public Mono<ServerResponse> deleteDataFormElementType(ServerRequest request) {
    return this.deleteDataFormElementTypeByIdHandler.deleteDataFormElementType(request);
  }

  // </editor-fold>

}

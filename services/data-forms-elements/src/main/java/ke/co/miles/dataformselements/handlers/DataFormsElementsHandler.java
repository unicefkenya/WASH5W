/*
 * Copyright (C) 2021 Second Mile
 *
 * This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0.
 * If a copy of the MPL was not distributed with this file,
 * You can obtain one at http://mozilla.org/MPL/2.0/.
 */
package ke.co.miles.dataformselements.handlers;

import ke.co.miles.dataformselements.handlers.delete.DeleteDataFormElementHandler;
import ke.co.miles.dataformselements.handlers.get.RetrieveDataFormElementHandler;
import ke.co.miles.dataformselements.handlers.get.RetrieveDataFormsElementsHandler;
import ke.co.miles.dataformselements.handlers.post.CreateDataFormElementHandler;
import ke.co.miles.dataformselements.handlers.put.UpdateDataFormElementHandler;
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
public class DataFormsElementsHandler {

  // POST HANDLERS
  @Autowired
  CreateDataFormElementHandler createDataFormElementHandler;

  // GET HANDLERS
  @Autowired
  RetrieveDataFormElementHandler retrieveDataFormElementByIdHandler;

  @Autowired
  RetrieveDataFormsElementsHandler retrieveDataFormsElementsHandler;

  // PUT HANDLERS
  @Autowired
  UpdateDataFormElementHandler updateDataFormElementHandler;

  // DELETE HANDLERS
  @Autowired
  DeleteDataFormElementHandler deleteDataFormElementByIdHandler;


  // <editor-fold desc="POST">
  public Mono<ServerResponse> createDataFormElement(ServerRequest request) {
    return this.createDataFormElementHandler.createDataFormElement(request);
  }

  // </editor-fold>

  // <editor-fold desc="GET">

  public Mono<ServerResponse> retrieveDataFormElement(ServerRequest request) {
    return this.retrieveDataFormElementByIdHandler.retrieveDataFormElement(request);
  }

  public Mono<ServerResponse> retrieveDataFormsElements(ServerRequest request) {
    return this.retrieveDataFormsElementsHandler.retrieveDataFormsElements(request);
  }

  // </editor-fold>

  // <editor-fold desc="PUT">
  public Mono<ServerResponse> updateDataFormElement(ServerRequest request) {
    return this.updateDataFormElementHandler.updateDataFormElement(request);
  }

  // </editor-fold>

  // <editor-fold desc="DELETE">
  public Mono<ServerResponse> deleteDataFormElement(ServerRequest request) {
    return this.deleteDataFormElementByIdHandler.deleteDataFormElement(request);
  }

  // </editor-fold>

}

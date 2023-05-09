/*
 * Copyright (C) 2021 Second Mile
 *
 * This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0.
 * If a copy of the MPL was not distributed with this file,
 * You can obtain one at http://mozilla.org/MPL/2.0/.
 */
package ke.co.miles.dataforms.handlers;

import ke.co.miles.dataforms.handlers.delete.DeleteDataFormHandler;
import ke.co.miles.dataforms.handlers.get.RetrieveDataFormHandler;
import ke.co.miles.dataforms.handlers.get.RetrieveDataFormsHandler;
import ke.co.miles.dataforms.handlers.post.CreateDataFormHandler;
import ke.co.miles.dataforms.handlers.put.UpdateDataFormHandler;
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
public class DataFormsHandler {

  // POST HANDLERS
  @Autowired
  CreateDataFormHandler createDataFormHandler;

  // GET HANDLERS
  @Autowired
  RetrieveDataFormHandler retrieveDataFormByIdHandler;

  @Autowired
  RetrieveDataFormsHandler retrieveDataFormsHandler;

  // PUT HANDLERS
  @Autowired
  UpdateDataFormHandler updateDataFormHandler;

  // DELETE HANDLERS
  @Autowired
  DeleteDataFormHandler deleteDataFormByIdHandler;


  // <editor-fold desc="POST">
  public Mono<ServerResponse> createDataForm(ServerRequest request) {
    return this.createDataFormHandler.createDataForm(request);
  }

  // </editor-fold>

  // <editor-fold desc="GET">

  public Mono<ServerResponse> retrieveDataForm(ServerRequest request) {
    return this.retrieveDataFormByIdHandler.retrieveDataForm(request);
  }

  public Mono<ServerResponse> retrieveDataForms(ServerRequest request) {
    return this.retrieveDataFormsHandler.retrieveDataForms(request);
  }

  // </editor-fold>

  // <editor-fold desc="PUT">
  public Mono<ServerResponse> updateDataForm(ServerRequest request) {
    return this.updateDataFormHandler.updateDataForm(request);
  }

  // </editor-fold>

  // <editor-fold desc="DELETE">
  public Mono<ServerResponse> deleteDataForm(ServerRequest request) {
    return this.deleteDataFormByIdHandler.deleteDataForm(request);
  }

  // </editor-fold>

}

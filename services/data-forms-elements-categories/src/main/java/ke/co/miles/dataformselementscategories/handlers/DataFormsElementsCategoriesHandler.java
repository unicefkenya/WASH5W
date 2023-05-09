/*
 * Copyright (C) 2021 Second Mile
 *
 * This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0.
 * If a copy of the MPL was not distributed with this file,
 * You can obtain one at http://mozilla.org/MPL/2.0/.
 */
package ke.co.miles.dataformselementscategories.handlers;

import ke.co.miles.dataformselementscategories.handlers.delete.DeleteDataFormElementCategoryHandler;
import ke.co.miles.dataformselementscategories.handlers.get.RetrieveDataFormElementCategoryHandler;
import ke.co.miles.dataformselementscategories.handlers.get.RetrieveDataFormsElementsCategoriesHandler;
import ke.co.miles.dataformselementscategories.handlers.post.CreateDataFormElementCategoryHandler;
import ke.co.miles.dataformselementscategories.handlers.put.UpdateDataFormElementCategoryHandler;
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
public class DataFormsElementsCategoriesHandler {

  // POST HANDLERS
  @Autowired
  CreateDataFormElementCategoryHandler createDataFormElementCategoryHandler;

  // GET HANDLERS
  @Autowired
  RetrieveDataFormElementCategoryHandler retrieveDataFormElementCategoryByIdHandler;

  @Autowired
  RetrieveDataFormsElementsCategoriesHandler retrieveDataFormsElementsCategoriesHandler;

  // PUT HANDLERS
  @Autowired
  UpdateDataFormElementCategoryHandler updateDataFormElementCategoryHandler;

  // DELETE HANDLERS
  @Autowired
  DeleteDataFormElementCategoryHandler deleteDataFormElementCategoryByIdHandler;


  // <editor-fold desc="POST">
  public Mono<ServerResponse> createDataFormElementCategory(ServerRequest request) {
    return this.createDataFormElementCategoryHandler.createDataFormElementCategory(request);
  }

  // </editor-fold>

  // <editor-fold desc="GET">

  public Mono<ServerResponse> retrieveDataFormElementCategory(ServerRequest request) {
    return this.retrieveDataFormElementCategoryByIdHandler.retrieveDataFormElementCategory(request);
  }

  public Mono<ServerResponse> retrieveDataFormsElementsCategories(ServerRequest request) {
    return this.retrieveDataFormsElementsCategoriesHandler.retrieveDataFormsElementsCategories(request);
  }

  // </editor-fold>

  // <editor-fold desc="PUT">
  public Mono<ServerResponse> updateDataFormElementCategory(ServerRequest request) {
    return this.updateDataFormElementCategoryHandler.updateDataFormElementCategory(request);
  }

  // </editor-fold>

  // <editor-fold desc="DELETE">
  public Mono<ServerResponse> deleteDataFormElementCategory(ServerRequest request) {
    return this.deleteDataFormElementCategoryByIdHandler.deleteDataFormElementCategory(request);
  }

  // </editor-fold>

}

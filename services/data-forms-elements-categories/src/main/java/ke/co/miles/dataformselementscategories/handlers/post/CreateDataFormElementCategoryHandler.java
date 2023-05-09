/*
 * Copyright (C) 2021 Second Mile
 *
 * This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0.
 * If a copy of the MPL was not distributed with this file,
 * You can obtain one at http://mozilla.org/MPL/2.0/.
 */
package ke.co.miles.dataformselementscategories.handlers.post;

import ke.co.miles.dataformselementscategories.exceptions.ServerException;
import ke.co.miles.dataformselementscategories.models.DataFormElementCategory;
import ke.co.miles.dataformselementscategories.repository.DataFormsElementsCategoriesRepository;
import ke.co.miles.dataformselementscategories.util.builders.DataFormElementCategoryBuilder;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
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
public class CreateDataFormElementCategoryHandler {

  @Autowired
  DataFormsElementsCategoriesRepository repository;

  /**
   * Creates a dataFormElementCategory record
   *
   * @param request the request containing the details of the dataFormElementCategory record to be created and the
   *                database within which it should be created
   * @return the response containing the details of the newly created dataFormElementCategory record
   */
  public Mono<ServerResponse> createDataFormElementCategory(ServerRequest request) {

    log.trace("Entering createDataFormElementCategory()");

    return
        ServerResponse
            .status(HttpStatus.CREATED)
            .contentType(MediaType.APPLICATION_JSON)
            .body(
                request
                    .bodyToMono(DataFormElementCategory.class)
                    .flatMap(dataFormElementCategory ->
                        repository
                            .insertDataFormElementCategory(dataFormElementCategory)
                            .map(id ->
                                new DataFormElementCategoryBuilder()
                                    .id(id)
                                    .data(dataFormElementCategory.getData())
                                    .version(1)
                                    .build())),
                DataFormElementCategory.class)
            .onErrorMap(e -> new ServerException("DataFormElementCategory creation failed", e));
  }


}

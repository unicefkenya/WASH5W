/*
 * Copyright (C) 2021 Second Mile
 *
 * This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0.
 * If a copy of the MPL was not distributed with this file,
 * You can obtain one at http://mozilla.org/MPL/2.0/.
 */
package ke.co.miles.dataformselementscategories.handlers.put;

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
public class UpdateDataFormElementCategoryHandler {

  @Autowired
  DataFormsElementsCategoriesRepository repository;

  /**
   * Updates a dataFormElementCategory record
   *
   * @param request the request containing the details of the dataFormElementCategory record to be updated
   * @return the response containing the details of the newly updated dataFormElementCategory record
   */
  public Mono<ServerResponse> updateDataFormElementCategory(ServerRequest request) {

    log.trace("Entering updateDataFormElementCategory()");

    return
        ServerResponse
            .status(HttpStatus.OK)
            .contentType(MediaType.APPLICATION_JSON)
            .body(
                request
                    .bodyToMono(DataFormElementCategory.class)
                    .flatMap(dataFormElementCategory ->
                        repository
                            .updateDataFormElementCategory(dataFormElementCategory)
                            .map(count ->
                                new DataFormElementCategoryBuilder()
                                    .id(dataFormElementCategory.getId())
                                    .data(dataFormElementCategory.getData())
                                    .version(dataFormElementCategory.getVersion() + 1)
                                    .build())),
                DataFormElementCategory.class)
            .onErrorMap(e -> new ServerException("DataFormElementCategory update failed", e));

  }

}

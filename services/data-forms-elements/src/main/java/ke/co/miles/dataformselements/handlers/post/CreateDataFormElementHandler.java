/*
 * Copyright (C) 2021 Second Mile
 *
 * This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0.
 * If a copy of the MPL was not distributed with this file,
 * You can obtain one at http://mozilla.org/MPL/2.0/.
 */
package ke.co.miles.dataformselements.handlers.post;

import ke.co.miles.dataformselements.exceptions.ServerException;
import ke.co.miles.dataformselements.models.DataFormElement;
import ke.co.miles.dataformselements.repository.DataFormsElementsRepository;
import ke.co.miles.dataformselements.util.builders.DataFormElementBuilder;
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
public class CreateDataFormElementHandler {

  @Autowired
  DataFormsElementsRepository repository;

  /**
   * Creates a dataFormElement record
   *
   * @param request the request containing the details of the dataFormElement record to be created and the
   *                database within which it should be created
   * @return the response containing the details of the newly created dataFormElement record
   */
  public Mono<ServerResponse> createDataFormElement(ServerRequest request) {

    log.trace("Entering createDataFormElement()");

    return
        ServerResponse
            .status(HttpStatus.CREATED)
            .contentType(MediaType.APPLICATION_JSON)
            .body(
                request
                    .bodyToMono(DataFormElement.class)
                    .flatMap(dataFormElement ->
                        repository
                            .insertDataFormElement(dataFormElement)
                            .map(id ->
                                new DataFormElementBuilder()
                                    .id(id)
                                    .data(dataFormElement.getData())
                                    .version(1)
                                    .build())),
                DataFormElement.class)
            .onErrorMap(e -> new ServerException("DataFormElement creation failed", e));
  }


}

/*
 * Copyright (C) 2021 Second Mile
 *
 * This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0.
 * If a copy of the MPL was not distributed with this file,
 * You can obtain one at http://mozilla.org/MPL/2.0/.
 */
package ke.co.miles.dataformselements.handlers.put;

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
public class UpdateDataFormElementHandler {

  @Autowired
  DataFormsElementsRepository repository;

  /**
   * Updates a dataFormElement record
   *
   * @param request the request containing the details of the dataFormElement record to be updated
   * @return the response containing the details of the newly updated dataFormElement record
   */
  public Mono<ServerResponse> updateDataFormElement(ServerRequest request) {

    log.trace("Entering updateDataFormElement()");

    return
        ServerResponse
            .status(HttpStatus.OK)
            .contentType(MediaType.APPLICATION_JSON)
            .body(
                request
                    .bodyToMono(DataFormElement.class)
                    .flatMap(dataFormElement ->
                        repository
                            .updateDataFormElement(dataFormElement)
                            .map(count ->
                                new DataFormElementBuilder()
                                    .id(dataFormElement.getId())
                                    .data(dataFormElement.getData())
                                    .version(dataFormElement.getVersion() + 1)
                                    .build())),
                DataFormElement.class)
            .onErrorMap(e -> new ServerException("DataFormElement update failed", e));

  }

}

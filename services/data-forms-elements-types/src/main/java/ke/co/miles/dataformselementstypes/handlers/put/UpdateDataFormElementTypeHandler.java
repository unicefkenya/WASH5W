/*
 * Copyright (C) 2021 Second Mile
 *
 * This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0.
 * If a copy of the MPL was not distributed with this file,
 * You can obtain one at http://mozilla.org/MPL/2.0/.
 */
package ke.co.miles.dataformselementstypes.handlers.put;

import ke.co.miles.dataformselementstypes.exceptions.ServerException;
import ke.co.miles.dataformselementstypes.models.DataFormElementType;
import ke.co.miles.dataformselementstypes.repository.DataFormsElementsTypesRepository;
import ke.co.miles.dataformselementstypes.util.builders.DataFormElementTypeBuilder;
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
public class UpdateDataFormElementTypeHandler {

  @Autowired
  DataFormsElementsTypesRepository repository;

  /**
   * Updates a dataFormElementType record
   *
   * @param request the request containing the details of the dataFormElementType record to be updated
   * @return the response containing the details of the newly updated dataFormElementType record
   */
  public Mono<ServerResponse> updateDataFormElementType(ServerRequest request) {

    log.trace("Entering updateDataFormElementType()");

    return
        ServerResponse
            .status(HttpStatus.OK)
            .contentType(MediaType.APPLICATION_JSON)
            .body(
                request
                    .bodyToMono(DataFormElementType.class)
                    .flatMap(dataFormElementType ->
                        repository
                            .updateDataFormElementType(dataFormElementType)
                            .map(count ->
                                new DataFormElementTypeBuilder()
                                    .id(dataFormElementType.getId())
                                    .data(dataFormElementType.getData())
                                    .version(dataFormElementType.getVersion() + 1)
                                    .build())),
                DataFormElementType.class)
            .onErrorMap(e -> new ServerException("DataFormElementType update failed", e));

  }

}

/*
 * Copyright (C) 2021 Second Mile
 *
 * This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0.
 * If a copy of the MPL was not distributed with this file,
 * You can obtain one at http://mozilla.org/MPL/2.0/.
 */
package ke.co.miles.dataformselementstypes.handlers.get;

import ke.co.miles.dataformselementstypes.exceptions.ServerException;
import ke.co.miles.dataformselementstypes.models.DataFormElementType;
import ke.co.miles.dataformselementstypes.repository.DataFormsElementsTypesRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
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
public class RetrieveDataFormElementTypeHandler {

  @Autowired
  DataFormsElementsTypesRepository repository;

  /**
   * Retrieves a dataFormElementType record given its unique identifier
   *
   * @param request the request containing the unique identifier of the dataFormElementType record to be
   *                retrieved and the database from which it should be retrieved
   * @return the response containing the details of the retrieved dataFormElementType record
   */
  public Mono<ServerResponse> retrieveDataFormElementType(ServerRequest request) {

    log.trace("Entering retrieveDataFormElementType()");

    return
        ServerResponse
            .ok()
            .contentType(MediaType.APPLICATION_JSON)
            .body(
                repository
                    .selectDataFormElementType(Long.parseLong(request.pathVariable("id"))),
                DataFormElementType.class)
            .onErrorMap(e -> new ServerException("DataFormElementType deletion failed", e));

  }

}

/*
 * Copyright (C) 2021 Second Mile
 *
 * This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0.
 * If a copy of the MPL was not distributed with this file,
 * You can obtain one at http://mozilla.org/MPL/2.0/.
 */
package ke.co.miles.dissagregationsschemes.handlers.get;

import ke.co.miles.dissagregationsschemes.exceptions.ServerException;
import ke.co.miles.dissagregationsschemes.models.DissagregationScheme;
import ke.co.miles.dissagregationsschemes.repository.DissagregationsSchemesRepository;
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
public class RetrieveDissagregationSchemeHandler {

  @Autowired
  DissagregationsSchemesRepository repository;

  /**
   * Retrieves a dissagregationScheme record given its unique identifier
   *
   * @param request the request containing the unique identifier of the dissagregationScheme record to be
   *                retrieved and the database from which it should be retrieved
   * @return the response containing the details of the retrieved dissagregationScheme record
   */
  public Mono<ServerResponse> retrieveDissagregationScheme(ServerRequest request) {

    log.trace("Entering retrieveDissagregationScheme()");

    return
        ServerResponse
            .ok()
            .contentType(MediaType.APPLICATION_JSON)
            .body(
                repository
                    .selectDissagregationScheme(Long.parseLong(request.pathVariable("id"))),
                DissagregationScheme.class)
            .onErrorMap(e -> new ServerException("DissagregationScheme deletion failed", e));

  }

}

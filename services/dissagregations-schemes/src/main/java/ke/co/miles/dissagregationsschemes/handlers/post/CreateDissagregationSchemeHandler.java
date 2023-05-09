/*
 * Copyright (C) 2021 Second Mile
 *
 * This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0.
 * If a copy of the MPL was not distributed with this file,
 * You can obtain one at http://mozilla.org/MPL/2.0/.
 */
package ke.co.miles.dissagregationsschemes.handlers.post;

import ke.co.miles.dissagregationsschemes.exceptions.ServerException;
import ke.co.miles.dissagregationsschemes.models.DissagregationScheme;
import ke.co.miles.dissagregationsschemes.repository.DissagregationsSchemesRepository;
import ke.co.miles.dissagregationsschemes.util.builders.DissagregationSchemeBuilder;
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
public class CreateDissagregationSchemeHandler {

  @Autowired
  DissagregationsSchemesRepository repository;

  /**
   * Creates a dissagregationScheme record
   *
   * @param request the request containing the details of the dissagregationScheme record to be created and the
   *                database within which it should be created
   * @return the response containing the details of the newly created dissagregationScheme record
   */
  public Mono<ServerResponse> createDissagregationScheme(ServerRequest request) {

    log.trace("Entering createDissagregationScheme()");

    return
        ServerResponse
            .status(HttpStatus.CREATED)
            .contentType(MediaType.APPLICATION_JSON)
            .body(
                request
                    .bodyToMono(DissagregationScheme.class)
                    .flatMap(dissagregationScheme ->
                        repository
                            .insertDissagregationScheme(dissagregationScheme)
                            .map(id ->
                                new DissagregationSchemeBuilder()
                                    .id(id)
                                    .data(dissagregationScheme.getData())
                                    .version(1)
                                    .build())),
                DissagregationScheme.class)
            .onErrorMap(e -> new ServerException("DissagregationScheme creation failed", e));
  }


}

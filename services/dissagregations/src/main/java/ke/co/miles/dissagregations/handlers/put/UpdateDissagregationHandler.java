/*
 * Copyright (C) 2021 Second Mile
 *
 * This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0.
 * If a copy of the MPL was not distributed with this file,
 * You can obtain one at http://mozilla.org/MPL/2.0/.
 */
package ke.co.miles.dissagregations.handlers.put;

import ke.co.miles.dissagregations.exceptions.ServerException;
import ke.co.miles.dissagregations.models.Dissagregation;
import ke.co.miles.dissagregations.repository.DissagregationsRepository;
import ke.co.miles.dissagregations.util.builders.DissagregationBuilder;
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
public class UpdateDissagregationHandler {

  @Autowired
  DissagregationsRepository repository;

  /**
   * Updates a dissagregation record
   *
   * @param request the request containing the details of the dissagregation record to be updated
   * @return the response containing the details of the newly updated dissagregation record
   */
  public Mono<ServerResponse> updateDissagregation(ServerRequest request) {

    log.trace("Entering updateDissagregation()");

    return
        ServerResponse
            .status(HttpStatus.OK)
            .contentType(MediaType.APPLICATION_JSON)
            .body(
                request
                    .bodyToMono(Dissagregation.class)
                    .flatMap(dissagregation ->
                        repository
                            .updateDissagregation(dissagregation)
                            .map(count ->
                                new DissagregationBuilder()
                                    .id(dissagregation.getId())
                                    .data(dissagregation.getData())
                                    .version(dissagregation.getVersion() + 1)
                                    .build())),
                Dissagregation.class)
            .onErrorMap(e -> new ServerException("Dissagregation update failed", e));

  }

}

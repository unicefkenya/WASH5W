/*
 * Copyright (C) 2021 Second Mile
 *
 * This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0.
 * If a copy of the MPL was not distributed with this file,
 * You can obtain one at http://mozilla.org/MPL/2.0/.
 */
package ke.co.miles.accountabilities.handlers.post;

import ke.co.miles.accountabilities.exceptions.ServerException;
import ke.co.miles.accountabilities.models.Accountability;
import ke.co.miles.accountabilities.repository.AccountabilitiesRepository;
import ke.co.miles.accountabilities.util.builders.AccountabilityBuilder;
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
public class CreateAccountabilitiesHandler {

  @Autowired
  AccountabilitiesRepository repository;


  /**
   * Recursively creates accountabilities records
   *
   * @param request the request containing the details of the accountabilities records to be
   *                created
   * @return the stream of responses containing the details of the newly created accountabilities
   * types records
   */
  public Mono<ServerResponse> createAccountabilities(ServerRequest request) {

    log.trace("Entering createAccountabilities()");

    return
        ServerResponse
            .status(HttpStatus.CREATED)
            .contentType(MediaType.APPLICATION_JSON)
            .body(
                request
                    .bodyToFlux(Accountability.class)
                    .flatMap(accountability ->
                        repository
                            .insertAccountability(
                                request.pathVariable("database"),
                                accountability)
                            .map(id ->
                                new AccountabilityBuilder()
                                    .id(id)
                                    .data(accountability.getData())
                                    .version(1)
                                    .build())
                    ),
                Accountability.class)
            .onErrorMap(e -> new ServerException("Accountability creation failed", e));
  }


}

/*
 * Copyright (C) 2021 Second Mile
 *
 * This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0.
 * If a copy of the MPL was not distributed with this file,
 * You can obtain one at http://mozilla.org/MPL/2.0/.
 */
package ke.co.miles.accountabilitiestypes.handlers.post;

import ke.co.miles.accountabilitiestypes.exceptions.ServerException;
import ke.co.miles.accountabilitiestypes.models.AccountabilityType;
import ke.co.miles.accountabilitiestypes.repository.AccountabilitiesTypesRepository;
import ke.co.miles.accountabilitiestypes.util.builders.AccountabilityTypeBuilder;
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
public class CreateAccountabilitiesTypesHandler {

  @Autowired
  AccountabilitiesTypesRepository repository;


  /**
   * Recursively creates accountabilities types records
   *
   * @param request the request containing the details of the accountabilities types records to be
   *                created
   * @return the stream of responses containing the details of the newly created accountabilities
   * types records
   */
  public Mono<ServerResponse> createAccountabilitiesTypes(ServerRequest request) {

    log.trace("Entering createAccountabilitiesTypes()");

    return
        ServerResponse
            .status(HttpStatus.CREATED)
            .contentType(MediaType.APPLICATION_JSON)
            .body(
                request
                    .bodyToFlux(AccountabilityType.class)
                    .flatMap(accountabilityType ->
                        repository
                            .insertAccountabilityType(
                                request.pathVariable("database"),
                                accountabilityType)
                            .map(id ->
                                new AccountabilityTypeBuilder()
                                    .id(id)
                                    .data(accountabilityType.getData())
                                    .version(1)
                                    .build())
                    ),
                AccountabilityType.class)
            .onErrorMap(e -> new ServerException("Accountability Type creation failed", e));
  }


}

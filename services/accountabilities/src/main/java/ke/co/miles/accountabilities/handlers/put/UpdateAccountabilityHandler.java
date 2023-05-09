/*
 * Copyright (C) 2021 Second Mile
 *
 * This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0.
 * If a copy of the MPL was not distributed with this file,
 * You can obtain one at http://mozilla.org/MPL/2.0/.
 */
package ke.co.miles.accountabilities.handlers.put;

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
public class UpdateAccountabilityHandler {

  @Autowired
  AccountabilitiesRepository repository;

  /**
   * Updates an accountability record
   *
   * @param request the request containing the details of the accountability record to be
   *                updated
   * @return the response containing the details of the newly updated accountability record
   */
  public Mono<ServerResponse> updateAccountability(ServerRequest request) {

    log.trace("Entering updateAccountability()");

    return
        ServerResponse
            .status(HttpStatus.OK)
            .contentType(MediaType.APPLICATION_JSON)
            .body(
                request
                    .bodyToMono(Accountability.class)
                    .flatMap(accountability ->
                        repository
                            .updateAccountability(
                                request.pathVariable("database"),
                                accountability)
                            .map(count ->
                                new AccountabilityBuilder()
                                    .id(accountability.getId())
                                    .data(accountability.getData())
                                    .version(accountability.getVersion() + 1)
                                    .build())),
                Accountability.class)
            .onErrorMap(e -> new ServerException("Accountability update failed", e));

  }

}

/*
 * Copyright (C) 2021 Second Mile
 *
 * This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0.
 * If a copy of the MPL was not distributed with this file,
 * You can obtain one at http://mozilla.org/MPL/2.0/.
 */
package ke.co.miles.administrativesystems.handlers.post;

import ke.co.miles.administrativesystems.exceptions.ServerException;
import ke.co.miles.administrativesystems.models.AdministrativeSystem;
import ke.co.miles.administrativesystems.repository.AdministrativeSystemsRepository;
import ke.co.miles.administrativesystems.util.builders.AdministrativeSystemBuilder;
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
public class CreateAdministrativeSystemHandler {

  @Autowired
  AdministrativeSystemsRepository repository;

  /**
   * Creates a administrativeSystem record
   *
   * @param request the request containing the details of the administrativeSystem record to be created and the
   *                database within which it should be created
   * @return the response containing the details of the newly created administrativeSystem record
   */
  public Mono<ServerResponse> createAdministrativeSystem(ServerRequest request) {

    log.trace("Entering createAdministrativeSystem()");

    return
        ServerResponse
            .status(HttpStatus.CREATED)
            .contentType(MediaType.APPLICATION_JSON)
            .body(
                request
                    .bodyToMono(AdministrativeSystem.class)
                    .flatMap(administrativeSystem ->
                        repository
                            .insertAdministrativeSystem(administrativeSystem)
                            .map(id ->
                                new AdministrativeSystemBuilder()
                                    .id(id)
                                    .data(administrativeSystem.getData())
                                    .version(1)
                                    .build())),
                AdministrativeSystem.class)
            .onErrorMap(e -> new ServerException("AdministrativeSystem creation failed", e));
  }


}

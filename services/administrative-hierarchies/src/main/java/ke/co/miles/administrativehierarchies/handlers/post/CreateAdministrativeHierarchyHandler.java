/*
 * Copyright (C) 2021 Second Mile
 *
 * This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0.
 * If a copy of the MPL was not distributed with this file,
 * You can obtain one at http://mozilla.org/MPL/2.0/.
 */
package ke.co.miles.administrativehierarchies.handlers.post;

import ke.co.miles.administrativehierarchies.exceptions.ServerException;
import ke.co.miles.administrativehierarchies.models.AdministrativeHierarchy;
import ke.co.miles.administrativehierarchies.repository.AdministrativeHierarchiesRepository;
import ke.co.miles.administrativehierarchies.util.builders.AdministrativeHierarchyBuilder;
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
public class CreateAdministrativeHierarchyHandler {

  @Autowired
  AdministrativeHierarchiesRepository repository;

  /**
   * Creates a administrativeHierarchy record
   *
   * @param request the request containing the details of the administrativeHierarchy record to be created and the
   *                database within which it should be created
   * @return the response containing the details of the newly created administrativeHierarchy record
   */
  public Mono<ServerResponse> createAdministrativeHierarchy(ServerRequest request) {

    log.trace("Entering createAdministrativeHierarchy()");

    return
        ServerResponse
            .status(HttpStatus.CREATED)
            .contentType(MediaType.APPLICATION_JSON)
            .body(
                request
                    .bodyToMono(AdministrativeHierarchy.class)
                    .flatMap(administrativeHierarchy ->
                        repository
                            .insertAdministrativeHierarchy(administrativeHierarchy)
                            .map(id ->
                                new AdministrativeHierarchyBuilder()
                                    .id(id)
                                    .data(administrativeHierarchy.getData())
                                    .version(1)
                                    .build())),
                AdministrativeHierarchy.class)
            .onErrorMap(e -> new ServerException("AdministrativeHierarchy creation failed", e));
  }


}

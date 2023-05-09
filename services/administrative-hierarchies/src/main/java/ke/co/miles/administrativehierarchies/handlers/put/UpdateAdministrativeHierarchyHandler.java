/*
 * Copyright (C) 2021 Second Mile
 *
 * This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0.
 * If a copy of the MPL was not distributed with this file,
 * You can obtain one at http://mozilla.org/MPL/2.0/.
 */
package ke.co.miles.administrativehierarchies.handlers.put;

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
public class UpdateAdministrativeHierarchyHandler {

  @Autowired
  AdministrativeHierarchiesRepository repository;

  /**
   * Updates a administrativeHierarchy record
   *
   * @param request the request containing the details of the administrativeHierarchy record to be updated
   * @return the response containing the details of the newly updated administrativeHierarchy record
   */
  public Mono<ServerResponse> updateAdministrativeHierarchy(ServerRequest request) {

    log.trace("Entering updateAdministrativeHierarchy()");

    return
        ServerResponse
            .status(HttpStatus.OK)
            .contentType(MediaType.APPLICATION_JSON)
            .body(
                request
                    .bodyToMono(AdministrativeHierarchy.class)
                    .flatMap(administrativeHierarchy ->
                        repository
                            .updateAdministrativeHierarchy(administrativeHierarchy)
                            .map(count ->
                                new AdministrativeHierarchyBuilder()
                                    .id(administrativeHierarchy.getId())
                                    .data(administrativeHierarchy.getData())
                                    .version(administrativeHierarchy.getVersion() + 1)
                                    .build())),
                AdministrativeHierarchy.class)
            .onErrorMap(e -> new ServerException("AdministrativeHierarchy update failed", e));

  }

}

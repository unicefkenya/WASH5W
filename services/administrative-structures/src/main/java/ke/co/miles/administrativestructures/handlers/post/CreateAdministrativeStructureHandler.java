/*
 * Copyright (C) 2021 Second Mile
 *
 * This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0.
 * If a copy of the MPL was not distributed with this file,
 * You can obtain one at http://mozilla.org/MPL/2.0/.
 */
package ke.co.miles.administrativestructures.handlers.post;

import ke.co.miles.administrativestructures.exceptions.ServerException;
import ke.co.miles.administrativestructures.models.AdministrativeStructure;
import ke.co.miles.administrativestructures.repository.AdministrativeStructuresRepository;
import ke.co.miles.administrativestructures.util.builders.AdministrativeStructureBuilder;
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
public class CreateAdministrativeStructureHandler {

  @Autowired
  AdministrativeStructuresRepository repository;

  /**
   * Creates a administrativeStructure record
   *
   * @param request the request containing the details of the administrativeStructure record to be created and the
   *                database within which it should be created
   * @return the response containing the details of the newly created administrativeStructure record
   */
  public Mono<ServerResponse> createAdministrativeStructure(ServerRequest request) {

    log.trace("Entering createAdministrativeStructure()");

    return
        ServerResponse
            .status(HttpStatus.CREATED)
            .contentType(MediaType.APPLICATION_JSON)
            .body(
                request
                    .bodyToMono(AdministrativeStructure.class)
                    .flatMap(administrativeStructure ->
                        repository
                            .insertAdministrativeStructure(administrativeStructure)
                            .map(id ->
                                new AdministrativeStructureBuilder()
                                    .id(id)
                                    .data(administrativeStructure.getData())
                                    .version(1)
                                    .build())),
                AdministrativeStructure.class)
            .onErrorMap(e -> new ServerException("AdministrativeStructure creation failed", e));
  }


}

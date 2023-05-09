/*
 * Copyright (C) 2021 Second Mile
 *
 * This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0.
 * If a copy of the MPL was not distributed with this file,
 * You can obtain one at http://mozilla.org/MPL/2.0/.
 */
package ke.co.miles.units.handlers.post;

import ke.co.miles.units.exceptions.ServerException;
import ke.co.miles.units.models.Unit;
import ke.co.miles.units.repository.UnitsRepository;
import ke.co.miles.units.util.builders.UnitBuilder;
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
public class CreateUnitHandler {

  @Autowired
  UnitsRepository repository;

  /**
   * Creates a unit record
   *
   * @param request the request containing the details of the unit record to be created and the
   *                database within which it should be created
   * @return the response containing the details of the newly created unit record
   */
  public Mono<ServerResponse> createUnit(ServerRequest request) {

    log.trace("Entering createUnit()");

    return
        ServerResponse
            .status(HttpStatus.CREATED)
            .contentType(MediaType.APPLICATION_JSON)
            .body(
                request
                    .bodyToMono(Unit.class)
                    .flatMap(unit ->
                        repository
                            .insertUnit(unit)
                            .map(id ->
                                new UnitBuilder()
                                    .id(id)
                                    .data(unit.getData())
                                    .version(1)
                                    .build())),
                Unit.class)
            .onErrorMap(e -> new ServerException("Unit creation failed", e));
  }


}

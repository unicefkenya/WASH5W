/*
 * Copyright (C) 2021 Second Mile
 *
 * This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0.
 * If a copy of the MPL was not distributed with this file,
 * You can obtain one at http://mozilla.org/MPL/2.0/.
 */
package ke.co.miles.units.handlers.put;

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
public class UpdateUnitHandler {

  @Autowired
  UnitsRepository repository;

  /**
   * Updates a unit record
   *
   * @param request the request containing the details of the unit record to be updated
   * @return the response containing the details of the newly updated unit record
   */
  public Mono<ServerResponse> updateUnit(ServerRequest request) {

    log.trace("Entering updateUnit()");

    return
        ServerResponse
            .status(HttpStatus.OK)
            .contentType(MediaType.APPLICATION_JSON)
            .body(
                request
                    .bodyToMono(Unit.class)
                    .flatMap(unit ->
                        repository
                            .updateUnit(unit)
                            .map(count ->
                                new UnitBuilder()
                                    .id(unit.getId())
                                    .data(unit.getData())
                                    .version(unit.getVersion() + 1)
                                    .build())),
                Unit.class)
            .onErrorMap(e -> new ServerException("Unit update failed", e));

  }

}

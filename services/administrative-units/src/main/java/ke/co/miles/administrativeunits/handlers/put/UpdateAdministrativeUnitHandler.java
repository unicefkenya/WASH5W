/*
 * Copyright (C) 2021 Second Mile
 *
 * This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0.
 * If a copy of the MPL was not distributed with this file,
 * You can obtain one at http://mozilla.org/MPL/2.0/.
 */
package ke.co.miles.administrativeunits.handlers.put;

import ke.co.miles.administrativeunits.exceptions.ServerException;
import ke.co.miles.administrativeunits.models.AdministrativeUnit;
import ke.co.miles.administrativeunits.repository.AdministrativeUnitsRepository;
import ke.co.miles.administrativeunits.util.builders.AdministrativeUnitBuilder;
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
public class UpdateAdministrativeUnitHandler {

  @Autowired
  AdministrativeUnitsRepository repository;

  /**
   * Updates a administrativeUnit record
   *
   * @param request the request containing the details of the administrativeUnit record to be updated
   * @return the response containing the details of the newly updated administrativeUnit record
   */
  public Mono<ServerResponse> updateAdministrativeUnit(ServerRequest request) {

    log.trace("Entering updateAdministrativeUnit()");

    return
        ServerResponse
            .status(HttpStatus.OK)
            .contentType(MediaType.APPLICATION_JSON)
            .body(
                request
                    .bodyToMono(AdministrativeUnit.class)
                    .flatMap(administrativeUnit ->
                        repository
                            .updateAdministrativeUnit(administrativeUnit)
                            .map(count ->
                                new AdministrativeUnitBuilder()
                                    .id(administrativeUnit.getId())
                                    .data(administrativeUnit.getData())
                                    .version(administrativeUnit.getVersion() + 1)
                                    .build())),
                AdministrativeUnit.class)
            .onErrorMap(e -> new ServerException("AdministrativeUnit update failed", e));

  }

}

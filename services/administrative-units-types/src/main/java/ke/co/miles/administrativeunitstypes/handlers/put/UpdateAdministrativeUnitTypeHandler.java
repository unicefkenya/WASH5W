/*
 * Copyright (C) 2021 Second Mile
 *
 * This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0.
 * If a copy of the MPL was not distributed with this file,
 * You can obtain one at http://mozilla.org/MPL/2.0/.
 */
package ke.co.miles.administrativeunitstypes.handlers.put;

import ke.co.miles.administrativeunitstypes.exceptions.ServerException;
import ke.co.miles.administrativeunitstypes.models.AdministrativeUnitType;
import ke.co.miles.administrativeunitstypes.repository.AdministrativeUnitsTypesRepository;
import ke.co.miles.administrativeunitstypes.util.builders.AdministrativeUnitTypeBuilder;
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
public class UpdateAdministrativeUnitTypeHandler {

  @Autowired
  AdministrativeUnitsTypesRepository repository;

  /**
   * Updates a administrativeUnitType record
   *
   * @param request the request containing the details of the administrativeUnitType record to be updated
   * @return the response containing the details of the newly updated administrativeUnitType record
   */
  public Mono<ServerResponse> updateAdministrativeUnitType(ServerRequest request) {

    log.trace("Entering updateAdministrativeUnitType()");

    return
        ServerResponse
            .status(HttpStatus.OK)
            .contentType(MediaType.APPLICATION_JSON)
            .body(
                request
                    .bodyToMono(AdministrativeUnitType.class)
                    .flatMap(administrativeUnitType ->
                        repository
                            .updateAdministrativeUnitType(administrativeUnitType)
                            .map(count ->
                                new AdministrativeUnitTypeBuilder()
                                    .id(administrativeUnitType.getId())
                                    .data(administrativeUnitType.getData())
                                    .version(administrativeUnitType.getVersion() + 1)
                                    .build())),
                AdministrativeUnitType.class)
            .onErrorMap(e -> new ServerException("AdministrativeUnitType update failed", e));

  }

}

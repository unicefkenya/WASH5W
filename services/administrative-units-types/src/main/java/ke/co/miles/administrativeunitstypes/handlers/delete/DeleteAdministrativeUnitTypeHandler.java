/*
 * Copyright (C) 2021 Second Mile
 *
 * This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0.
 * If a copy of the MPL was not distributed with this file,
 * You can obtain one at http://mozilla.org/MPL/2.0/.
 */
package ke.co.miles.administrativeunitstypes.handlers.delete;

import ke.co.miles.administrativeunitstypes.exceptions.ServerException;
import ke.co.miles.administrativeunitstypes.repository.AdministrativeUnitsTypesRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
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
public class DeleteAdministrativeUnitTypeHandler {

  @Autowired
  AdministrativeUnitsTypesRepository repository;

  /**
   * Deletes a administrativeUnitType record
   *
   * @param request the request containing the details of the administrativeUnitType record to be deleted and the
   *                database from which it should be deleted
   * @return the response containing the number of administrativeUnitsTypes records deleted
   */
  public Mono<ServerResponse> deleteAdministrativeUnitType(ServerRequest request) {

    log.trace("Entering deleteAdministrativeUnitType()");

    return
        ServerResponse
            .ok()
            .contentType(MediaType.APPLICATION_JSON)
            .body(
                repository
                    .deleteAdministrativeUnitTypeById(Long.parseLong(request.pathVariable("id"))),
                Integer.class)
            .onErrorMap(e -> new ServerException("AdministrativeUnitType deletion failed", e));
  }

}

/*
 * Copyright (C) 2021 Second Mile
 *
 * This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0.
 * If a copy of the MPL was not distributed with this file,
 * You can obtain one at http://mozilla.org/MPL/2.0/.
 */
package ke.co.miles.administrativeunitstypes.handlers;

import ke.co.miles.administrativeunitstypes.handlers.delete.DeleteAdministrativeUnitTypeHandler;
import ke.co.miles.administrativeunitstypes.handlers.get.RetrieveAdministrativeUnitTypeHandler;
import ke.co.miles.administrativeunitstypes.handlers.get.RetrieveAdministrativeUnitsTypesHandler;
import ke.co.miles.administrativeunitstypes.handlers.post.CreateAdministrativeUnitTypeHandler;
import ke.co.miles.administrativeunitstypes.handlers.put.UpdateAdministrativeUnitTypeHandler;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
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
public class AdministrativeUnitsTypesHandler {

  // POST HANDLERS
  @Autowired
  CreateAdministrativeUnitTypeHandler createAdministrativeUnitTypeHandler;

  // GET HANDLERS
  @Autowired
  RetrieveAdministrativeUnitTypeHandler retrieveAdministrativeUnitTypeByIdHandler;

  @Autowired
  RetrieveAdministrativeUnitsTypesHandler retrieveAdministrativeUnitsTypesHandler;

  // PUT HANDLERS
  @Autowired
  UpdateAdministrativeUnitTypeHandler updateAdministrativeUnitTypeHandler;

  // DELETE HANDLERS
  @Autowired
  DeleteAdministrativeUnitTypeHandler deleteAdministrativeUnitTypeByIdHandler;


  // <editor-fold desc="POST">
  public Mono<ServerResponse> createAdministrativeUnitType(ServerRequest request) {
    return this.createAdministrativeUnitTypeHandler.createAdministrativeUnitType(request);
  }

  // </editor-fold>

  // <editor-fold desc="GET">

  public Mono<ServerResponse> retrieveAdministrativeUnitType(ServerRequest request) {
    return this.retrieveAdministrativeUnitTypeByIdHandler.retrieveAdministrativeUnitType(request);
  }

  public Mono<ServerResponse> retrieveAdministrativeUnitsTypes(ServerRequest request) {
    return this.retrieveAdministrativeUnitsTypesHandler.retrieveAdministrativeUnitsTypes(request);
  }

  // </editor-fold>

  // <editor-fold desc="PUT">
  public Mono<ServerResponse> updateAdministrativeUnitType(ServerRequest request) {
    return this.updateAdministrativeUnitTypeHandler.updateAdministrativeUnitType(request);
  }

  // </editor-fold>

  // <editor-fold desc="DELETE">
  public Mono<ServerResponse> deleteAdministrativeUnitType(ServerRequest request) {
    return this.deleteAdministrativeUnitTypeByIdHandler.deleteAdministrativeUnitType(request);
  }

  // </editor-fold>

}

/*
 * Copyright (C) 2021 Second Mile
 *
 * This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0.
 * If a copy of the MPL was not distributed with this file,
 * You can obtain one at http://mozilla.org/MPL/2.0/.
 */
package ke.co.miles.administrativeunits.handlers;

import ke.co.miles.administrativeunits.handlers.delete.DeleteAdministrativeUnitHandler;
import ke.co.miles.administrativeunits.handlers.get.RetrieveAdministrativeUnitHandler;
import ke.co.miles.administrativeunits.handlers.get.RetrieveAdministrativeUnitsHandler;
import ke.co.miles.administrativeunits.handlers.post.CreateAdministrativeUnitHandler;
import ke.co.miles.administrativeunits.handlers.put.UpdateAdministrativeUnitHandler;
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
public class AdministrativeUnitsHandler {

  // POST HANDLERS
  @Autowired
  CreateAdministrativeUnitHandler createAdministrativeUnitHandler;

  // GET HANDLERS
  @Autowired
  RetrieveAdministrativeUnitHandler retrieveAdministrativeUnitByIdHandler;

  @Autowired
  RetrieveAdministrativeUnitsHandler retrieveAdministrativeUnitsHandler;

  // PUT HANDLERS
  @Autowired
  UpdateAdministrativeUnitHandler updateAdministrativeUnitHandler;

  // DELETE HANDLERS
  @Autowired
  DeleteAdministrativeUnitHandler deleteAdministrativeUnitByIdHandler;


  // <editor-fold desc="POST">
  public Mono<ServerResponse> createAdministrativeUnit(ServerRequest request) {
    return this.createAdministrativeUnitHandler.createAdministrativeUnit(request);
  }

  // </editor-fold>

  // <editor-fold desc="GET">

  public Mono<ServerResponse> retrieveAdministrativeUnit(ServerRequest request) {
    return this.retrieveAdministrativeUnitByIdHandler.retrieveAdministrativeUnit(request);
  }

  public Mono<ServerResponse> retrieveAdministrativeUnits(ServerRequest request) {
    return this.retrieveAdministrativeUnitsHandler.retrieveAdministrativeUnits(request);
  }

  // </editor-fold>

  // <editor-fold desc="PUT">
  public Mono<ServerResponse> updateAdministrativeUnit(ServerRequest request) {
    return this.updateAdministrativeUnitHandler.updateAdministrativeUnit(request);
  }

  // </editor-fold>

  // <editor-fold desc="DELETE">
  public Mono<ServerResponse> deleteAdministrativeUnit(ServerRequest request) {
    return this.deleteAdministrativeUnitByIdHandler.deleteAdministrativeUnit(request);
  }

  // </editor-fold>

}

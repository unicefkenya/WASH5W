/*
 * Copyright (C) 2021 Second Mile
 *
 * This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0.
 * If a copy of the MPL was not distributed with this file,
 * You can obtain one at http://mozilla.org/MPL/2.0/.
 */
package ke.co.miles.administrativestructures.handlers;

import ke.co.miles.administrativestructures.handlers.delete.DeleteAdministrativeStructureHandler;
import ke.co.miles.administrativestructures.handlers.get.RetrieveAdministrativeStructureHandler;
import ke.co.miles.administrativestructures.handlers.get.RetrieveAdministrativeStructuresHandler;
import ke.co.miles.administrativestructures.handlers.post.CreateAdministrativeStructureHandler;
import ke.co.miles.administrativestructures.handlers.put.UpdateAdministrativeStructureHandler;
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
public class AdministrativeStructuresHandler {

  // POST HANDLERS
  @Autowired
  CreateAdministrativeStructureHandler createAdministrativeStructureHandler;

  // GET HANDLERS
  @Autowired
  RetrieveAdministrativeStructureHandler retrieveAdministrativeStructureByIdHandler;

  @Autowired
  RetrieveAdministrativeStructuresHandler retrieveAdministrativeStructuresHandler;

  // PUT HANDLERS
  @Autowired
  UpdateAdministrativeStructureHandler updateAdministrativeStructureHandler;

  // DELETE HANDLERS
  @Autowired
  DeleteAdministrativeStructureHandler deleteAdministrativeStructureByIdHandler;


  // <editor-fold desc="POST">
  public Mono<ServerResponse> createAdministrativeStructure(ServerRequest request) {
    return this.createAdministrativeStructureHandler.createAdministrativeStructure(request);
  }

  // </editor-fold>

  // <editor-fold desc="GET">

  public Mono<ServerResponse> retrieveAdministrativeStructure(ServerRequest request) {
    return this.retrieveAdministrativeStructureByIdHandler.retrieveAdministrativeStructure(request);
  }

  public Mono<ServerResponse> retrieveAdministrativeStructures(ServerRequest request) {
    return this.retrieveAdministrativeStructuresHandler.retrieveAdministrativeStructures(request);
  }

  // </editor-fold>

  // <editor-fold desc="PUT">
  public Mono<ServerResponse> updateAdministrativeStructure(ServerRequest request) {
    return this.updateAdministrativeStructureHandler.updateAdministrativeStructure(request);
  }

  // </editor-fold>

  // <editor-fold desc="DELETE">
  public Mono<ServerResponse> deleteAdministrativeStructure(ServerRequest request) {
    return this.deleteAdministrativeStructureByIdHandler.deleteAdministrativeStructure(request);
  }

  // </editor-fold>

}

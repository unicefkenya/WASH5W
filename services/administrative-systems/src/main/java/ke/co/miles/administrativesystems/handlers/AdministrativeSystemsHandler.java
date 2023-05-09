/*
 * Copyright (C) 2021 Second Mile
 *
 * This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0.
 * If a copy of the MPL was not distributed with this file,
 * You can obtain one at http://mozilla.org/MPL/2.0/.
 */
package ke.co.miles.administrativesystems.handlers;

import ke.co.miles.administrativesystems.handlers.delete.DeleteAdministrativeSystemHandler;
import ke.co.miles.administrativesystems.handlers.get.RetrieveAdministrativeSystemHandler;
import ke.co.miles.administrativesystems.handlers.get.RetrieveAdministrativeSystemsHandler;
import ke.co.miles.administrativesystems.handlers.post.CreateAdministrativeSystemHandler;
import ke.co.miles.administrativesystems.handlers.put.UpdateAdministrativeSystemHandler;
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
public class AdministrativeSystemsHandler {

  // POST HANDLERS
  @Autowired
  CreateAdministrativeSystemHandler createAdministrativeSystemHandler;

  // GET HANDLERS
  @Autowired
  RetrieveAdministrativeSystemHandler retrieveAdministrativeSystemByIdHandler;

  @Autowired
  RetrieveAdministrativeSystemsHandler retrieveAdministrativeSystemsHandler;

  // PUT HANDLERS
  @Autowired
  UpdateAdministrativeSystemHandler updateAdministrativeSystemHandler;

  // DELETE HANDLERS
  @Autowired
  DeleteAdministrativeSystemHandler deleteAdministrativeSystemByIdHandler;


  // <editor-fold desc="POST">
  public Mono<ServerResponse> createAdministrativeSystem(ServerRequest request) {
    return this.createAdministrativeSystemHandler.createAdministrativeSystem(request);
  }

  // </editor-fold>

  // <editor-fold desc="GET">

  public Mono<ServerResponse> retrieveAdministrativeSystem(ServerRequest request) {
    return this.retrieveAdministrativeSystemByIdHandler.retrieveAdministrativeSystem(request);
  }

  public Mono<ServerResponse> retrieveAdministrativeSystems(ServerRequest request) {
    return this.retrieveAdministrativeSystemsHandler.retrieveAdministrativeSystems(request);
  }

  // </editor-fold>

  // <editor-fold desc="PUT">
  public Mono<ServerResponse> updateAdministrativeSystem(ServerRequest request) {
    return this.updateAdministrativeSystemHandler.updateAdministrativeSystem(request);
  }

  // </editor-fold>

  // <editor-fold desc="DELETE">
  public Mono<ServerResponse> deleteAdministrativeSystem(ServerRequest request) {
    return this.deleteAdministrativeSystemByIdHandler.deleteAdministrativeSystem(request);
  }

  // </editor-fold>

}

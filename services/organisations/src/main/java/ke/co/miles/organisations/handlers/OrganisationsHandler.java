/*
 * Copyright (C) 2021 Second Mile
 *
 * This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0.
 * If a copy of the MPL was not distributed with this file,
 * You can obtain one at http://mozilla.org/MPL/2.0/.
 */
package ke.co.miles.organisations.handlers;

import ke.co.miles.organisations.handlers.delete.DeleteOrganisationHandler;
import ke.co.miles.organisations.handlers.get.RetrieveOrganisationsHandler;
import ke.co.miles.organisations.handlers.get.RetrieveOrganisationHandler;
import ke.co.miles.organisations.handlers.post.CreateOrganisationHandler;
import ke.co.miles.organisations.handlers.put.UpdateOrganisationHandler;
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
public class OrganisationsHandler {

  // POST HANDLERS
  @Autowired
  CreateOrganisationHandler createOrganisationHandler;

  // GET HANDLERS
  @Autowired
  RetrieveOrganisationHandler retrieveOrganisationByIdHandler;

  @Autowired
  RetrieveOrganisationsHandler retrieveOrganisationsHandler;

  // PUT HANDLERS
  @Autowired
  UpdateOrganisationHandler updateOrganisationHandler;

  // DELETE HANDLERS
  @Autowired
  DeleteOrganisationHandler deleteOrganisationByIdHandler;


  // <editor-fold desc="POST">
  public Mono<ServerResponse> createOrganisation(ServerRequest request) {
    return this.createOrganisationHandler.createOrganisation(request);
  }

  // </editor-fold>

  // <editor-fold desc="GET">

  public Mono<ServerResponse> retrieveOrganisation(ServerRequest request) {
    return this.retrieveOrganisationByIdHandler.retrieveOrganisation(request);
  }

  public Mono<ServerResponse> retrieveOrganisations(ServerRequest request) {
    return this.retrieveOrganisationsHandler.retrieveOrganisations(request);
  }

  // </editor-fold>

  // <editor-fold desc="PUT">
  public Mono<ServerResponse> updateOrganisation(ServerRequest request) {
    return this.updateOrganisationHandler.updateOrganisation(request);
  }

  // </editor-fold>

  // <editor-fold desc="DELETE">
  public Mono<ServerResponse> deleteOrganisation(ServerRequest request) {
    return this.deleteOrganisationByIdHandler.deleteOrganisation(request);
  }

  // </editor-fold>

}

/*
 * Copyright (C) 2021 Second Mile
 *
 * This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0.
 * If a copy of the MPL was not distributed with this file,
 * You can obtain one at http://mozilla.org/MPL/2.0/.
 */
package ke.co.miles.organisationstypes.handlers;

import ke.co.miles.organisationstypes.handlers.delete.DeleteOrganisationTypeHandler;
import ke.co.miles.organisationstypes.handlers.get.RetrieveOrganisationTypeHandler;
import ke.co.miles.organisationstypes.handlers.get.RetrieveOrganisationsTypesHandler;
import ke.co.miles.organisationstypes.handlers.post.CreateOrganisationTypeHandler;
import ke.co.miles.organisationstypes.handlers.put.UpdateOrganisationTypeHandler;
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
public class OrganisationsTypesHandler {

  // POST HANDLERS
  @Autowired
  CreateOrganisationTypeHandler createOrganisationTypeHandler;

  // GET HANDLERS
  @Autowired
  RetrieveOrganisationTypeHandler retrieveOrganisationTypeByIdHandler;

  @Autowired
  RetrieveOrganisationsTypesHandler retrieveOrganisationsTypesHandler;

  // PUT HANDLERS
  @Autowired
  UpdateOrganisationTypeHandler updateOrganisationTypeHandler;

  // DELETE HANDLERS
  @Autowired
  DeleteOrganisationTypeHandler deleteOrganisationTypeByIdHandler;


  // <editor-fold desc="POST">
  public Mono<ServerResponse> createOrganisationType(ServerRequest request) {
    return this.createOrganisationTypeHandler.createOrganisationType(request);
  }

  // </editor-fold>

  // <editor-fold desc="GET">

  public Mono<ServerResponse> retrieveOrganisationType(ServerRequest request) {
    return this.retrieveOrganisationTypeByIdHandler.retrieveOrganisationType(request);
  }

  public Mono<ServerResponse> retrieveOrganisationsTypes(ServerRequest request) {
    return this.retrieveOrganisationsTypesHandler.retrieveOrganisationsTypes(request);
  }

  // </editor-fold>

  // <editor-fold desc="PUT">
  public Mono<ServerResponse> updateOrganisationType(ServerRequest request) {
    return this.updateOrganisationTypeHandler.updateOrganisationType(request);
  }

  // </editor-fold>

  // <editor-fold desc="DELETE">
  public Mono<ServerResponse> deleteOrganisationType(ServerRequest request) {
    return this.deleteOrganisationTypeByIdHandler.deleteOrganisationType(request);
  }

  // </editor-fold>

}

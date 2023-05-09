/*
 * Copyright (C) 2021 Second Mile
 *
 * This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0.
 * If a copy of the MPL was not distributed with this file,
 * You can obtain one at http://mozilla.org/MPL/2.0/.
 */
package ke.co.miles.administrativehierarchies.handlers;

import ke.co.miles.administrativehierarchies.handlers.delete.DeleteAdministrativeHierarchyHandler;
import ke.co.miles.administrativehierarchies.handlers.get.RetrieveAdministrativeHierarchyHandler;
import ke.co.miles.administrativehierarchies.handlers.get.RetrieveAdministrativeHierarchiesHandler;
import ke.co.miles.administrativehierarchies.handlers.post.CreateAdministrativeHierarchyHandler;
import ke.co.miles.administrativehierarchies.handlers.put.UpdateAdministrativeHierarchyHandler;
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
public class AdministrativeHierarchiesHandler {

  // POST HANDLERS
  @Autowired
  CreateAdministrativeHierarchyHandler createAdministrativeHierarchyHandler;

  // GET HANDLERS
  @Autowired
  RetrieveAdministrativeHierarchyHandler retrieveAdministrativeHierarchyByIdHandler;

  @Autowired
  RetrieveAdministrativeHierarchiesHandler retrieveAdministrativeHierarchiesHandler;

  // PUT HANDLERS
  @Autowired
  UpdateAdministrativeHierarchyHandler updateAdministrativeHierarchyHandler;

  // DELETE HANDLERS
  @Autowired
  DeleteAdministrativeHierarchyHandler deleteAdministrativeHierarchyByIdHandler;


  // <editor-fold desc="POST">
  public Mono<ServerResponse> createAdministrativeHierarchy(ServerRequest request) {
    return this.createAdministrativeHierarchyHandler.createAdministrativeHierarchy(request);
  }

  // </editor-fold>

  // <editor-fold desc="GET">

  public Mono<ServerResponse> retrieveAdministrativeHierarchy(ServerRequest request) {
    return this.retrieveAdministrativeHierarchyByIdHandler.retrieveAdministrativeHierarchy(request);
  }

  public Mono<ServerResponse> retrieveAdministrativeHierarchies(ServerRequest request) {
    return this.retrieveAdministrativeHierarchiesHandler.retrieveAdministrativeHierarchies(request);
  }

  // </editor-fold>

  // <editor-fold desc="PUT">
  public Mono<ServerResponse> updateAdministrativeHierarchy(ServerRequest request) {
    return this.updateAdministrativeHierarchyHandler.updateAdministrativeHierarchy(request);
  }

  // </editor-fold>

  // <editor-fold desc="DELETE">
  public Mono<ServerResponse> deleteAdministrativeHierarchy(ServerRequest request) {
    return this.deleteAdministrativeHierarchyByIdHandler.deleteAdministrativeHierarchy(request);
  }

  // </editor-fold>

}

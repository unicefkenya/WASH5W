/*
 * Copyright (C) 2021 Second Mile
 *
 * This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0.
 * If a copy of the MPL was not distributed with this file,
 * You can obtain one at http://mozilla.org/MPL/2.0/.
 */
package ke.co.miles.systemsroles.handlers;

import ke.co.miles.systemsroles.handlers.delete.DeleteSystemRoleHandler;
import ke.co.miles.systemsroles.handlers.get.RetrieveSystemRoleHandler;
import ke.co.miles.systemsroles.handlers.get.RetrieveSystemsRolesHandler;
import ke.co.miles.systemsroles.handlers.post.CreateSystemRoleHandler;
import ke.co.miles.systemsroles.handlers.put.UpdateSystemRoleHandler;
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
public class SystemsRolesHandler {

  // POST HANDLERS
  @Autowired
  CreateSystemRoleHandler createSystemRoleHandler;

  // GET HANDLERS
  @Autowired
  RetrieveSystemRoleHandler retrieveSystemRoleByIdHandler;

  @Autowired
  RetrieveSystemsRolesHandler retrieveSystemsRolesHandler;

  // PUT HANDLERS
  @Autowired
  UpdateSystemRoleHandler updateSystemRoleHandler;

  // DELETE HANDLERS
  @Autowired
  DeleteSystemRoleHandler deleteSystemRoleByIdHandler;


  // <editor-fold desc="POST">
  public Mono<ServerResponse> createSystemRole(ServerRequest request) {
    return this.createSystemRoleHandler.createSystemRole(request);
  }

  // </editor-fold>

  // <editor-fold desc="GET">

  public Mono<ServerResponse> retrieveSystemRole(ServerRequest request) {
    return this.retrieveSystemRoleByIdHandler.retrieveSystemRole(request);
  }

  public Mono<ServerResponse> retrieveSystemsRoles(ServerRequest request) {
    return this.retrieveSystemsRolesHandler.retrieveSystemsRoles(request);
  }

  // </editor-fold>

  // <editor-fold desc="PUT">
  public Mono<ServerResponse> updateSystemRole(ServerRequest request) {
    return this.updateSystemRoleHandler.updateSystemRole(request);
  }

  // </editor-fold>

  // <editor-fold desc="DELETE">
  public Mono<ServerResponse> deleteSystemRole(ServerRequest request) {
    return this.deleteSystemRoleByIdHandler.deleteSystemRole(request);
  }

  // </editor-fold>

}

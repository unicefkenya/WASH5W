/*
 * Copyright (C) 2021 Second Mile
 *
 * This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0.
 * If a copy of the MPL was not distributed with this file,
 * You can obtain one at http://mozilla.org/MPL/2.0/.
 */
package ke.co.miles.systemsmodulespermissions.handlers;

import ke.co.miles.systemsmodulespermissions.handlers.delete.DeleteSystemModulePermissionHandler;
import ke.co.miles.systemsmodulespermissions.handlers.get.RetrieveSystemModulePermissionHandler;
import ke.co.miles.systemsmodulespermissions.handlers.get.RetrieveSystemsModulesPermissionsHandler;
import ke.co.miles.systemsmodulespermissions.handlers.post.CreateSystemModulePermissionHandler;
import ke.co.miles.systemsmodulespermissions.handlers.put.UpdateSystemModulePermissionHandler;
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
public class SystemsModulesPermissionsHandler {

  // POST HANDLERS
  @Autowired
  CreateSystemModulePermissionHandler createSystemModulePermissionHandler;

  // GET HANDLERS
  @Autowired
  RetrieveSystemModulePermissionHandler retrieveSystemModulePermissionByIdHandler;

  @Autowired
  RetrieveSystemsModulesPermissionsHandler retrieveSystemsModulesPermissionsHandler;

  // PUT HANDLERS
  @Autowired
  UpdateSystemModulePermissionHandler updateSystemModulePermissionHandler;

  // DELETE HANDLERS
  @Autowired
  DeleteSystemModulePermissionHandler deleteSystemModulePermissionByIdHandler;


  // <editor-fold desc="POST">
  public Mono<ServerResponse> createSystemModulePermission(ServerRequest request) {
    return this.createSystemModulePermissionHandler.createSystemModulePermission(request);
  }

  // </editor-fold>

  // <editor-fold desc="GET">

  public Mono<ServerResponse> retrieveSystemModulePermission(ServerRequest request) {
    return this.retrieveSystemModulePermissionByIdHandler.retrieveSystemModulePermission(request);
  }

  public Mono<ServerResponse> retrieveSystemsModulesPermissions(ServerRequest request) {
    return this.retrieveSystemsModulesPermissionsHandler.retrieveSystemsModulesPermissions(request);
  }

  // </editor-fold>

  // <editor-fold desc="PUT">
  public Mono<ServerResponse> updateSystemModulePermission(ServerRequest request) {
    return this.updateSystemModulePermissionHandler.updateSystemModulePermission(request);
  }

  // </editor-fold>

  // <editor-fold desc="DELETE">
  public Mono<ServerResponse> deleteSystemModulePermission(ServerRequest request) {
    return this.deleteSystemModulePermissionByIdHandler.deleteSystemModulePermission(request);
  }

  // </editor-fold>

}

/*
 * Copyright (C) 2021 Second Mile
 *
 * This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0.
 * If a copy of the MPL was not distributed with this file,
 * You can obtain one at http://mozilla.org/MPL/2.0/.
 */
package ke.co.miles.systemmodules.handlers;

import ke.co.miles.systemmodules.handlers.delete.DeleteSystemModuleHandler;
import ke.co.miles.systemmodules.handlers.get.RetrieveSystemModuleHandler;
import ke.co.miles.systemmodules.handlers.get.RetrieveSystemsModulesHandler;
import ke.co.miles.systemmodules.handlers.post.CreateSystemModuleHandler;
import ke.co.miles.systemmodules.handlers.put.UpdateSystemModuleHandler;
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
public class SystemsModulesHandler {

  // POST HANDLERS
  @Autowired
  CreateSystemModuleHandler createSystemModuleHandler;

  // GET HANDLERS
  @Autowired
  RetrieveSystemModuleHandler retrieveSystemModuleByIdHandler;

  @Autowired
  RetrieveSystemsModulesHandler retrieveSystemsModulesHandler;

  // PUT HANDLERS
  @Autowired
  UpdateSystemModuleHandler updateSystemModuleHandler;

  // DELETE HANDLERS
  @Autowired
  DeleteSystemModuleHandler deleteSystemModuleByIdHandler;


  // <editor-fold desc="POST">
  public Mono<ServerResponse> createSystemModule(ServerRequest request) {
    return this.createSystemModuleHandler.createSystemModule(request);
  }

  // </editor-fold>

  // <editor-fold desc="GET">

  public Mono<ServerResponse> retrieveSystemModule(ServerRequest request) {
    return this.retrieveSystemModuleByIdHandler.retrieveSystemModule(request);
  }

  public Mono<ServerResponse> retrieveSystemsModules(ServerRequest request) {
    return this.retrieveSystemsModulesHandler.retrieveSystemsModules(request);
  }

  // </editor-fold>

  // <editor-fold desc="PUT">
  public Mono<ServerResponse> updateSystemModule(ServerRequest request) {
    return this.updateSystemModuleHandler.updateSystemModule(request);
  }

  // </editor-fold>

  // <editor-fold desc="DELETE">
  public Mono<ServerResponse> deleteSystemModule(ServerRequest request) {
    return this.deleteSystemModuleByIdHandler.deleteSystemModule(request);
  }

  // </editor-fold>

}

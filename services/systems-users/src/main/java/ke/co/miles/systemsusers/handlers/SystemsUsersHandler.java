/*
 * Copyright (C) 2021 Second Mile
 *
 * This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0.
 * If a copy of the MPL was not distributed with this file,
 * You can obtain one at http://mozilla.org/MPL/2.0/.
 */
package ke.co.miles.systemsusers.handlers;

import ke.co.miles.systemsusers.handlers.delete.DeleteSystemUserHandler;
import ke.co.miles.systemsusers.handlers.get.RetrieveSystemUserHandler;
import ke.co.miles.systemsusers.handlers.get.RetrieveSystemsUsersHandler;
import ke.co.miles.systemsusers.handlers.post.CreateSystemUserHandler;
import ke.co.miles.systemsusers.handlers.put.UpdateSystemUserHandler;
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
public class SystemsUsersHandler {

  // POST HANDLERS
  @Autowired
  CreateSystemUserHandler createSystemUserHandler;

  // GET HANDLERS
  @Autowired
  RetrieveSystemUserHandler retrieveSystemUserByIdHandler;

  @Autowired
  RetrieveSystemsUsersHandler retrieveSystemsUsersHandler;

  // PUT HANDLERS
  @Autowired
  UpdateSystemUserHandler updateSystemUserHandler;

  // DELETE HANDLERS
  @Autowired
  DeleteSystemUserHandler deleteSystemUserByIdHandler;


  // <editor-fold desc="POST">
  public Mono<ServerResponse> createSystemUser(ServerRequest request) {
    return this.createSystemUserHandler.createSystemUser(request);
  }

  // </editor-fold>

  // <editor-fold desc="GET">

  public Mono<ServerResponse> retrieveSystemUser(ServerRequest request) {
    return this.retrieveSystemUserByIdHandler.retrieveSystemUser(request);
  }

  public Mono<ServerResponse> retrieveSystemsUsers(ServerRequest request) {
    return this.retrieveSystemsUsersHandler.retrieveSystemsUsers(request);
  }

  // </editor-fold>

  // <editor-fold desc="PUT">
  public Mono<ServerResponse> updateSystemUser(ServerRequest request) {
    return this.updateSystemUserHandler.updateSystemUser(request);
  }

  // </editor-fold>

  // <editor-fold desc="DELETE">
  public Mono<ServerResponse> deleteSystemUser(ServerRequest request) {
    return this.deleteSystemUserByIdHandler.deleteSystemUser(request);
  }

  // </editor-fold>

}

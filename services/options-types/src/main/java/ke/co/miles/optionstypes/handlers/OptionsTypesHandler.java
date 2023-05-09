/*
 * Copyright (C) 2021 Second Mile
 *
 * This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0.
 * If a copy of the MPL was not distributed with this file,
 * You can obtain one at http://mozilla.org/MPL/2.0/.
 */
package ke.co.miles.optionstypes.handlers;

import ke.co.miles.optionstypes.handlers.delete.DeleteOptionTypeHandler;
import ke.co.miles.optionstypes.handlers.get.RetrieveOptionTypeHandler;
import ke.co.miles.optionstypes.handlers.get.RetrieveOptionsTypesHandler;
import ke.co.miles.optionstypes.handlers.post.CreateOptionTypeHandler;
import ke.co.miles.optionstypes.handlers.put.UpdateOptionTypeHandler;
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
public class OptionsTypesHandler {

  // POST HANDLERS
  @Autowired
  CreateOptionTypeHandler createOptionTypeHandler;

  // GET HANDLERS
  @Autowired
  RetrieveOptionTypeHandler retrieveOptionTypeByIdHandler;

  @Autowired
  RetrieveOptionsTypesHandler retrieveOptionsTypesHandler;

  // PUT HANDLERS
  @Autowired
  UpdateOptionTypeHandler updateOptionTypeHandler;

  // DELETE HANDLERS
  @Autowired
  DeleteOptionTypeHandler deleteOptionTypeByIdHandler;


  // <editor-fold desc="POST">
  public Mono<ServerResponse> createOptionType(ServerRequest request) {
    return this.createOptionTypeHandler.createOptionType(request);
  }

  // </editor-fold>

  // <editor-fold desc="GET">

  public Mono<ServerResponse> retrieveOptionType(ServerRequest request) {
    return this.retrieveOptionTypeByIdHandler.retrieveOptionType(request);
  }

  public Mono<ServerResponse> retrieveOptionsTypes(ServerRequest request) {
    return this.retrieveOptionsTypesHandler.retrieveOptionsTypes(request);
  }

  // </editor-fold>

  // <editor-fold desc="PUT">
  public Mono<ServerResponse> updateOptionType(ServerRequest request) {
    return this.updateOptionTypeHandler.updateOptionType(request);
  }

  // </editor-fold>

  // <editor-fold desc="DELETE">
  public Mono<ServerResponse> deleteOptionType(ServerRequest request) {
    return this.deleteOptionTypeByIdHandler.deleteOptionType(request);
  }

  // </editor-fold>

}

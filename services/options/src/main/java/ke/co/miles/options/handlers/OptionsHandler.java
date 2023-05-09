/*
 * Copyright (C) 2021 Second Mile
 *
 * This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0.
 * If a copy of the MPL was not distributed with this file,
 * You can obtain one at http://mozilla.org/MPL/2.0/.
 */
package ke.co.miles.options.handlers;

import ke.co.miles.options.handlers.delete.DeleteOptionHandler;
import ke.co.miles.options.handlers.get.RetrieveOptionsHandler;
import ke.co.miles.options.handlers.get.RetrieveOptionHandler;
import ke.co.miles.options.handlers.post.CreateOptionHandler;
import ke.co.miles.options.handlers.put.UpdateOptionHandler;
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
public class OptionsHandler {

  // POST HANDLERS
  @Autowired
  CreateOptionHandler createOptionHandler;

  // GET HANDLERS
  @Autowired
  RetrieveOptionHandler retrieveOptionByIdHandler;

  @Autowired
  RetrieveOptionsHandler retrieveOptionsHandler;

  // PUT HANDLERS
  @Autowired
  UpdateOptionHandler updateOptionHandler;

  // DELETE HANDLERS
  @Autowired
  DeleteOptionHandler deleteOptionByIdHandler;


  // <editor-fold desc="POST">
  public Mono<ServerResponse> createOption(ServerRequest request) {
    return this.createOptionHandler.createOption(request);
  }

  // </editor-fold>

  // <editor-fold desc="GET">

  public Mono<ServerResponse> retrieveOption(ServerRequest request) {
    return this.retrieveOptionByIdHandler.retrieveOption(request);
  }

  public Mono<ServerResponse> retrieveOptions(ServerRequest request) {
    return this.retrieveOptionsHandler.retrieveOptions(request);
  }

  // </editor-fold>

  // <editor-fold desc="PUT">
  public Mono<ServerResponse> updateOption(ServerRequest request) {
    return this.updateOptionHandler.updateOption(request);
  }

  // </editor-fold>

  // <editor-fold desc="DELETE">
  public Mono<ServerResponse> deleteOption(ServerRequest request) {
    return this.deleteOptionByIdHandler.deleteOption(request);
  }

  // </editor-fold>

}

/*
 * Copyright (C) 2021 Second Mile
 *
 * This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0.
 * If a copy of the MPL was not distributed with this file,
 * You can obtain one at http://mozilla.org/MPL/2.0/.
 */
package ke.co.miles.operators.handlers;

import ke.co.miles.operators.handlers.delete.DeleteOperatorHandler;
import ke.co.miles.operators.handlers.get.RetrieveOperatorsHandler;
import ke.co.miles.operators.handlers.get.RetrieveOperatorHandler;
import ke.co.miles.operators.handlers.post.CreateOperatorHandler;
import ke.co.miles.operators.handlers.put.UpdateOperatorHandler;
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
public class OperatorsHandler {

  // POST HANDLERS
  @Autowired
  CreateOperatorHandler createOperatorHandler;

  // GET HANDLERS
  @Autowired
  RetrieveOperatorHandler retrieveOperatorByIdHandler;

  @Autowired
  RetrieveOperatorsHandler retrieveOperatorsHandler;

  // PUT HANDLERS
  @Autowired
  UpdateOperatorHandler updateOperatorHandler;

  // DELETE HANDLERS
  @Autowired
  DeleteOperatorHandler deleteOperatorByIdHandler;


  // <editor-fold desc="POST">
  public Mono<ServerResponse> createOperator(ServerRequest request) {
    return this.createOperatorHandler.createOperator(request);
  }

  // </editor-fold>

  // <editor-fold desc="GET">

  public Mono<ServerResponse> retrieveOperator(ServerRequest request) {
    return this.retrieveOperatorByIdHandler.retrieveOperator(request);
  }

  public Mono<ServerResponse> retrieveOperators(ServerRequest request) {
    return this.retrieveOperatorsHandler.retrieveOperators(request);
  }

  // </editor-fold>

  // <editor-fold desc="PUT">
  public Mono<ServerResponse> updateOperator(ServerRequest request) {
    return this.updateOperatorHandler.updateOperator(request);
  }

  // </editor-fold>

  // <editor-fold desc="DELETE">
  public Mono<ServerResponse> deleteOperator(ServerRequest request) {
    return this.deleteOperatorByIdHandler.deleteOperator(request);
  }

  // </editor-fold>

}

/*
 * Copyright (C) 2021 Second Mile
 *
 * This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0.
 * If a copy of the MPL was not distributed with this file,
 * You can obtain one at http://mozilla.org/MPL/2.0/.
 */
package ke.co.miles.indicators.handlers;

import ke.co.miles.indicators.handlers.delete.DeleteIndicatorHandler;
import ke.co.miles.indicators.handlers.get.RetrieveIndicatorsHandler;
import ke.co.miles.indicators.handlers.get.RetrieveIndicatorHandler;
import ke.co.miles.indicators.handlers.post.CreateIndicatorHandler;
import ke.co.miles.indicators.handlers.put.UpdateIndicatorHandler;
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
public class IndicatorsHandler {

  // POST HANDLERS
  @Autowired
  CreateIndicatorHandler createIndicatorHandler;

  // GET HANDLERS
  @Autowired
  RetrieveIndicatorHandler retrieveIndicatorByIdHandler;

  @Autowired
  RetrieveIndicatorsHandler retrieveIndicatorsHandler;

  // PUT HANDLERS
  @Autowired
  UpdateIndicatorHandler updateIndicatorHandler;

  // DELETE HANDLERS
  @Autowired
  DeleteIndicatorHandler deleteIndicatorByIdHandler;


  // <editor-fold desc="POST">
  public Mono<ServerResponse> createIndicator(ServerRequest request) {
    return this.createIndicatorHandler.createIndicator(request);
  }

  // </editor-fold>

  // <editor-fold desc="GET">

  public Mono<ServerResponse> retrieveIndicator(ServerRequest request) {
    return this.retrieveIndicatorByIdHandler.retrieveIndicator(request);
  }

  public Mono<ServerResponse> retrieveIndicators(ServerRequest request) {
    return this.retrieveIndicatorsHandler.retrieveIndicators(request);
  }

  // </editor-fold>

  // <editor-fold desc="PUT">
  public Mono<ServerResponse> updateIndicator(ServerRequest request) {
    return this.updateIndicatorHandler.updateIndicator(request);
  }

  // </editor-fold>

  // <editor-fold desc="DELETE">
  public Mono<ServerResponse> deleteIndicator(ServerRequest request) {
    return this.deleteIndicatorByIdHandler.deleteIndicator(request);
  }

  // </editor-fold>

}

/*
 * Copyright (C) 2021 Second Mile
 *
 * This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0.
 * If a copy of the MPL was not distributed with this file,
 * You can obtain one at http://mozilla.org/MPL/2.0/.
 */
package ke.co.miles.units.handlers;

import ke.co.miles.units.handlers.delete.DeleteUnitHandler;
import ke.co.miles.units.handlers.get.RetrieveUnitsHandler;
import ke.co.miles.units.handlers.get.RetrieveUnitHandler;
import ke.co.miles.units.handlers.post.CreateUnitHandler;
import ke.co.miles.units.handlers.put.UpdateUnitHandler;
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
public class UnitsHandler {

  // POST HANDLERS
  @Autowired
  CreateUnitHandler createUnitHandler;

  // GET HANDLERS
  @Autowired
  RetrieveUnitHandler retrieveUnitByIdHandler;

  @Autowired
  RetrieveUnitsHandler retrieveUnitsHandler;

  // PUT HANDLERS
  @Autowired
  UpdateUnitHandler updateUnitHandler;

  // DELETE HANDLERS
  @Autowired
  DeleteUnitHandler deleteUnitByIdHandler;


  // <editor-fold desc="POST">
  public Mono<ServerResponse> createUnit(ServerRequest request) {
    return this.createUnitHandler.createUnit(request);
  }

  // </editor-fold>

  // <editor-fold desc="GET">

  public Mono<ServerResponse> retrieveUnit(ServerRequest request) {
    return this.retrieveUnitByIdHandler.retrieveUnit(request);
  }

  public Mono<ServerResponse> retrieveUnits(ServerRequest request) {
    return this.retrieveUnitsHandler.retrieveUnits(request);
  }

  // </editor-fold>

  // <editor-fold desc="PUT">
  public Mono<ServerResponse> updateUnit(ServerRequest request) {
    return this.updateUnitHandler.updateUnit(request);
  }

  // </editor-fold>

  // <editor-fold desc="DELETE">
  public Mono<ServerResponse> deleteUnit(ServerRequest request) {
    return this.deleteUnitByIdHandler.deleteUnit(request);
  }

  // </editor-fold>

}

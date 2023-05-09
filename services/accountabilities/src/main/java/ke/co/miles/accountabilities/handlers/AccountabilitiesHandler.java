/*
 * Copyright (C) 2021 Second Mile
 *
 * This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0.
 * If a copy of the MPL was not distributed with this file,
 * You can obtain one at http://mozilla.org/MPL/2.0/.
 */
package ke.co.miles.accountabilities.handlers;

import ke.co.miles.accountabilities.handlers.delete.DeleteAccountabilitiesHandler;
import ke.co.miles.accountabilities.handlers.delete.DeleteAccountabilityHandler;
import ke.co.miles.accountabilities.handlers.get.RetrieveAccountabilitiesHandler;
import ke.co.miles.accountabilities.handlers.get.RetrieveAccountabilityHandler;
import ke.co.miles.accountabilities.handlers.get.RetrieveAscendantAccountabilitiesHandler;
import ke.co.miles.accountabilities.handlers.get.RetrieveDescendantAccountabilitiesHandler;
import ke.co.miles.accountabilities.handlers.get.RetrieveTotalAccountabilitiesHandler;
import ke.co.miles.accountabilities.handlers.post.CreateAccountabilitiesHandler;
import ke.co.miles.accountabilities.handlers.post.CreateAccountabilityHandler;
import ke.co.miles.accountabilities.handlers.put.UpdateAccountabilitiesEntityNamesHandler;
import ke.co.miles.accountabilities.handlers.put.UpdateAccountabilitiesHandler;
import ke.co.miles.accountabilities.handlers.put.UpdateAccountabilityHandler;
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
public class AccountabilitiesHandler {

  // POST HANDLERS
  @Autowired
  CreateAccountabilityHandler createAccountabilityHandler;

  @Autowired
  CreateAccountabilitiesHandler createAccountabilitiesHandler;


  // GET HANDLERS
  @Autowired
  RetrieveAccountabilityHandler retrieveAccountabilityByIdHandler;

  @Autowired
  RetrieveAccountabilitiesHandler retrieveAccountabilitiesHandler;

  @Autowired
  RetrieveDescendantAccountabilitiesHandler retrieveDescendantAccountabilitiesHandler;

  @Autowired
  RetrieveAscendantAccountabilitiesHandler retrieveAscendantAccountabilitiesHandler;

  @Autowired
  RetrieveTotalAccountabilitiesHandler retrieveTotalAccountabilitiesHandler;


  // PUT HANDLERS
  @Autowired
  UpdateAccountabilityHandler updateAccountabilityHandler;

  @Autowired
  UpdateAccountabilitiesHandler updateAccountabilitiesHandler;

  @Autowired
  UpdateAccountabilitiesEntityNamesHandler updateAccountabilitiesEntityNamesHandler;


  // DELETE HANDLERS
  @Autowired
  DeleteAccountabilityHandler deleteAccountabilityByIdHandler;

  @Autowired
  DeleteAccountabilitiesHandler deleteAccountabilitiesHandler;


  // <editor-fold desc="POST">
  public Mono<ServerResponse> createAccountability(ServerRequest request) {
    return this.createAccountabilityHandler.createAccountability(request);
  }

  public Mono<ServerResponse> createAccountabilities(ServerRequest request) {
    return createAccountabilitiesHandler.createAccountabilities(request);
  }

  // </editor-fold>

  // <editor-fold desc="GET">

  public Mono<ServerResponse> retrieveAccountability(ServerRequest request) {
    return this.retrieveAccountabilityByIdHandler.retrieveAccountability(request);
  }

  public Mono<ServerResponse> retrieveAccountabilities(ServerRequest request) {
    return this.retrieveAccountabilitiesHandler.retrieveAccountabilities(request);
  }

  public Mono<ServerResponse> retrieveAscendantAccountabilities(ServerRequest request) {
    return this.retrieveAscendantAccountabilitiesHandler.retrieveAscendantAccountabilities(
        request);
  }

  public Mono<ServerResponse> retrieveDescendantAccountabilities(ServerRequest request) {
    return this.retrieveDescendantAccountabilitiesHandler.retrieveDescendantAccountabilities(
        request);
  }

  public Mono<ServerResponse> retrieveTotalAccountabilities(ServerRequest request) {
    return this.retrieveTotalAccountabilitiesHandler.retrieveTotalAccountabilities(
        request);
  }

  // </editor-fold>

  // <editor-fold desc="PUT">
  public Mono<ServerResponse> updateAccountability(ServerRequest request) {
    return this.updateAccountabilityHandler.updateAccountability(request);
  }

  public Mono<ServerResponse> updateAccountabilities(ServerRequest request) {
    return this.updateAccountabilitiesHandler.updateAccountabilities(request);
  }

  public Mono<ServerResponse> updateAccountabilitiesEntityNames(ServerRequest request) {
    return this.updateAccountabilitiesEntityNamesHandler.updateAccountabilitiesEntityNames(request);
  }

  // </editor-fold>

  // <editor-fold desc="DELETE">
  public Mono<ServerResponse> deleteAccountability(ServerRequest request) {
    return this.deleteAccountabilityByIdHandler.deleteAccountability(request);
  }

  public Mono<ServerResponse> deleteAccountabilities(ServerRequest request) {
    return this.deleteAccountabilitiesHandler.deleteAccountabilities(request);
  }

  // </editor-fold>

}

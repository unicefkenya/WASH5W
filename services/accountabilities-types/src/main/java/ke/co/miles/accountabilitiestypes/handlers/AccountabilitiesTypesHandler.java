/*
 * Copyright (C) 2021 Second Mile
 *
 * This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0.
 * If a copy of the MPL was not distributed with this file,
 * You can obtain one at http://mozilla.org/MPL/2.0/.
 */
package ke.co.miles.accountabilitiestypes.handlers;

import ke.co.miles.accountabilitiestypes.handlers.delete.DeleteAccountabilitiesTypesHandler;
import ke.co.miles.accountabilitiestypes.handlers.delete.DeleteAccountabilityTypeHandler;
import ke.co.miles.accountabilitiestypes.handlers.get.RetrieveAccountabilitiesTypesHandler;
import ke.co.miles.accountabilitiestypes.handlers.get.RetrieveAccountabilityTypeHandler;
import ke.co.miles.accountabilitiestypes.handlers.get.RetrieveAscendantAccountabilitiesTypesHandler;
import ke.co.miles.accountabilitiestypes.handlers.get.RetrieveDescendantAccountabilitiesTypesHandler;
import ke.co.miles.accountabilitiestypes.handlers.get.RetrieveTotalAccountabilitiesTypesHandler;
import ke.co.miles.accountabilitiestypes.handlers.post.CreateAccountabilitiesTypesHandler;
import ke.co.miles.accountabilitiestypes.handlers.post.CreateAccountabilityTypeHandler;
import ke.co.miles.accountabilitiestypes.handlers.put.UpdateAccountabilitiesTypesEntityNamesHandler;
import ke.co.miles.accountabilitiestypes.handlers.put.UpdateAccountabilitiesTypesHandler;
import ke.co.miles.accountabilitiestypes.handlers.put.UpdateAccountabilityTypeHandler;
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
public class AccountabilitiesTypesHandler {

  // POST HANDLERS
  @Autowired
  CreateAccountabilityTypeHandler createAccountabilityTypeHandler;

  @Autowired
  CreateAccountabilitiesTypesHandler createAccountabilitiesTypesHandler;


  // GET HANDLERS
  @Autowired
  RetrieveAccountabilityTypeHandler retrieveAccountabilityTypeByIdHandler;

  @Autowired
  RetrieveAccountabilitiesTypesHandler retrieveAccountabilitiesTypesHandler;

  @Autowired
  RetrieveDescendantAccountabilitiesTypesHandler retrieveDescendantAccountabilitiesTypesHandler;

  @Autowired
  RetrieveAscendantAccountabilitiesTypesHandler retrieveAscendantAccountabilitiesTypesHandler;

  @Autowired
  RetrieveTotalAccountabilitiesTypesHandler retrieveTotalAccountabilitiesTypesHandler;


  // PUT HANDLERS
  @Autowired
  UpdateAccountabilityTypeHandler updateAccountabilityTypeHandler;

  @Autowired
  UpdateAccountabilitiesTypesHandler updateAccountabilitiesTypesHandler;

  @Autowired
  UpdateAccountabilitiesTypesEntityNamesHandler updateAccountabilitiesTypesEntityNamesHandler;


  // DELETE HANDLERS
  @Autowired
  DeleteAccountabilityTypeHandler deleteAccountabilityTypeByIdHandler;

  @Autowired
  DeleteAccountabilitiesTypesHandler deleteAccountabilitiesTypesHandler;


  // <editor-fold desc="POST">
  public Mono<ServerResponse> createAccountabilityType(ServerRequest request) {
    return this.createAccountabilityTypeHandler.createAccountabilityType(request);
  }

  public Mono<ServerResponse> createAccountabilitiesTypes(ServerRequest request) {
    return createAccountabilitiesTypesHandler.createAccountabilitiesTypes(request);
  }

  // </editor-fold>

  // <editor-fold desc="GET">

  public Mono<ServerResponse> retrieveAccountabilityType(ServerRequest request) {
    return this.retrieveAccountabilityTypeByIdHandler.retrieveAccountabilityType(request);
  }

  public Mono<ServerResponse> retrieveAccountabilitiesTypes(ServerRequest request) {
    return this.retrieveAccountabilitiesTypesHandler.retrieveAccountabilitiesTypes(request);
  }

  public Mono<ServerResponse> retrieveAscendantAccountabilitiesTypes(ServerRequest request) {
    return this.retrieveAscendantAccountabilitiesTypesHandler.retrieveAscendantAccountabilitiesTypes(
        request);
  }

  public Mono<ServerResponse> retrieveDescendantAccountabilitiesTypes(ServerRequest request) {
    return this.retrieveDescendantAccountabilitiesTypesHandler.retrieveDescendantAccountabilitiesTypes(
        request);
  }

  public Mono<ServerResponse> retrieveTotalAccountabilitiesTypes(ServerRequest request) {
    return this.retrieveTotalAccountabilitiesTypesHandler.retrieveTotalAccountabilitiesTypes(
        request);
  }

  // </editor-fold>

  // <editor-fold desc="PUT">
  public Mono<ServerResponse> updateAccountabilityType(ServerRequest request) {
    return this.updateAccountabilityTypeHandler.updateAccountabilityType(request);
  }

  public Mono<ServerResponse> updateAccountabilitiesTypes(ServerRequest request) {
    return this.updateAccountabilitiesTypesHandler.updateAccountabilitiesTypes(request);
  }

  public Mono<ServerResponse> updateAccountabilitiesTypesEntityNames(ServerRequest request) {
    return this.updateAccountabilitiesTypesEntityNamesHandler.updateAccountabilitiesTypesEntityNames(request);
  }

  // </editor-fold>

  // <editor-fold desc="DELETE">
  public Mono<ServerResponse> deleteAccountabilityType(ServerRequest request) {
    return this.deleteAccountabilityTypeByIdHandler.deleteAccountabilityType(request);
  }

  public Mono<ServerResponse> deleteAccountabilitiesTypes(ServerRequest request) {
    return this.deleteAccountabilitiesTypesHandler.deleteAccountabilitiesTypes(request);
  }

  // </editor-fold>

}

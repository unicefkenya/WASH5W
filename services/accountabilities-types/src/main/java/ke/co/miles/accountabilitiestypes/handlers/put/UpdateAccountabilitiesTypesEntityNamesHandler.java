/*
 * Copyright (C) 2021 Second Mile
 *
 * This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0.
 * If a copy of the MPL was not distributed with this file,
 * You can obtain one at http://mozilla.org/MPL/2.0/.
 */
package ke.co.miles.accountabilitiestypes.handlers.put;

import ke.co.miles.accountabilitiestypes.exceptions.ServerException;
import ke.co.miles.accountabilitiestypes.models.AccountabilityType;
import ke.co.miles.accountabilitiestypes.repository.AccountabilitiesTypesRepository;
import ke.co.miles.accountabilitiestypes.util.builders.AccountabilityTypeBuilder;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
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
public class UpdateAccountabilitiesTypesEntityNamesHandler {

  @Autowired
  AccountabilitiesTypesRepository repository;

  /**
   * Updates the names of the commissioning or responsible entities in accountability types records
   *
   * @param request the request containing the details of the accountability type record to be
   *                updated
   * @return the response containing the details of the newly updated accountability type record
   */
  public Mono<ServerResponse> updateAccountabilitiesTypesEntityNames(ServerRequest request) {

    log.trace("Entering updateAccountabilitiesTypesEntityNames()");

    return
        ServerResponse
            .status(HttpStatus.OK)
            .contentType(MediaType.APPLICATION_JSON)
            .body(
                request
                    .bodyToMono(String.class)
                    .flatMap(entityName ->
                        repository
                            .updateAccountabilitiesTypesEntityNames(
                                request.pathVariable("database"),
                                Long.parseLong(request.pathVariable("entityId")),
                                entityName)),
                Integer.class)
            .onErrorMap(e -> new ServerException("Accountabilities Types records update failed", e));


  }

}

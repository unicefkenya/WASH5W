/*
 * Copyright (C) 2021 Second Mile
 *
 * This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0.
 * If a copy of the MPL was not distributed with this file,
 * You can obtain one at http://mozilla.org/MPL/2.0/.
 */
package ke.co.miles.accountabilitiestypes.handlers.get;

import ke.co.miles.accountabilitiestypes.exceptions.ServerException;
import ke.co.miles.accountabilitiestypes.models.AccountabilityType;
import ke.co.miles.accountabilitiestypes.repository.AccountabilitiesTypesRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
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
public class RetrieveAccountabilitiesTypesHandler {

  @Autowired
  AccountabilitiesTypesRepository repository;

  /**
   * Retrieves all AccountabilitiesTypes or specific AccountabilitiesTypes if given their unique
   * identifiers
   *
   * @param request the request, optionally containing the query filters of the accountabilities
   *                types records to be retrieved and the database from which they should be
   *                retrieved
   * @return the stream of responses containing the details of the retrieved accountabilities types
   * records
   */
  public Mono<ServerResponse> retrieveAccountabilitiesTypes(ServerRequest request) {

    log.trace("Entering retrieveAccountabilitiesTypes()");

    return
        ServerResponse
            .ok()
            .contentType(MediaType.APPLICATION_JSON)
            .body(
                repository
                    .selectAccountabilitiesTypes(
                        request.pathVariable("database"),
                        request.queryParams()),
                AccountabilityType.class)
            .onErrorMap(e -> new ServerException("Accountabilities Types retrieval", e));
  }


}

/*
 * Copyright (C) 2021 Second Mile
 *
 * This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0.
 * If a copy of the MPL was not distributed with this file,
 * You can obtain one at http://mozilla.org/MPL/2.0/.
 */
package ke.co.miles.accountabilities.handlers.put;

import ke.co.miles.accountabilities.exceptions.ServerException;
import ke.co.miles.accountabilities.models.Accountability;
import ke.co.miles.accountabilities.repository.AccountabilitiesRepository;
import ke.co.miles.accountabilities.util.builders.AccountabilityBuilder;
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
public class UpdateAccountabilitiesEntityNamesHandler {

  @Autowired
  AccountabilitiesRepository repository;

  /**
   * Updates the names of the commissioning or responsible entities in accountabilitys records
   *
   * @param request the request containing the details of the accountability record to be
   *                updated
   * @return the response containing the details of the newly updated accountability record
   */
  public Mono<ServerResponse> updateAccountabilitiesEntityNames(ServerRequest request) {

    log.trace("Entering updateAccountabilitiesEntityNames()");

    return
        ServerResponse
            .status(HttpStatus.OK)
            .contentType(MediaType.APPLICATION_JSON)
            .body(
                request
                    .bodyToMono(String.class)
                    .flatMap(entityName ->
                        repository
                            .updateAccountabilitiesEntityNames(
                                request.pathVariable("database"),
                                Long.parseLong(request.pathVariable("entityId")),
                                entityName)),
                Integer.class)
            .onErrorMap(e -> new ServerException("Accountabilities records update failed", e));


  }

}

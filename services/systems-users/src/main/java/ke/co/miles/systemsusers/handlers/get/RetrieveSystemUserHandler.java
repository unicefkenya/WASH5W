/*
 * Copyright (C) 2021 Second Mile
 *
 * This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0.
 * If a copy of the MPL was not distributed with this file,
 * You can obtain one at http://mozilla.org/MPL/2.0/.
 */
package ke.co.miles.systemsusers.handlers.get;

import ke.co.miles.systemsusers.exceptions.ServerException;
import ke.co.miles.systemsusers.models.SystemUser;
import ke.co.miles.systemsusers.repository.SystemsUsersRepository;
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
public class RetrieveSystemUserHandler {

  @Autowired
  SystemsUsersRepository repository;

  /**
   * Retrieves a systemUser record given its unique identifier
   *
   * @param request the request containing the unique identifier of the systemUser record to be
   *                retrieved and the database from which it should be retrieved
   * @return the response containing the details of the retrieved systemUser record
   */
  public Mono<ServerResponse> retrieveSystemUser(ServerRequest request) {

    log.trace("Entering retrieveSystemUser()");

    return
        ServerResponse
            .ok()
            .contentType(MediaType.APPLICATION_JSON)
            .body(
                repository
                    .selectSystemUser(Long.parseLong(request.pathVariable("id"))),
                SystemUser.class)
            .onErrorMap(e -> new ServerException("SystemUser deletion failed", e));

  }

}

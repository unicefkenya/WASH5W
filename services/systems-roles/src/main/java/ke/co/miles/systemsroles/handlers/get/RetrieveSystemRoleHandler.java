/*
 * Copyright (C) 2021 Second Mile
 *
 * This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0.
 * If a copy of the MPL was not distributed with this file,
 * You can obtain one at http://mozilla.org/MPL/2.0/.
 */
package ke.co.miles.systemsroles.handlers.get;

import ke.co.miles.systemsroles.exceptions.ServerException;
import ke.co.miles.systemsroles.models.SystemRole;
import ke.co.miles.systemsroles.repository.SystemsRolesRepository;
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
public class RetrieveSystemRoleHandler {

  @Autowired
  SystemsRolesRepository repository;

  /**
   * Retrieves a systemRole record given its unique identifier
   *
   * @param request the request containing the unique identifier of the systemRole record to be
   *                retrieved and the database from which it should be retrieved
   * @return the response containing the details of the retrieved systemRole record
   */
  public Mono<ServerResponse> retrieveSystemRole(ServerRequest request) {

    log.trace("Entering retrieveSystemRole()");

    return
        ServerResponse
            .ok()
            .contentType(MediaType.APPLICATION_JSON)
            .body(
                repository
                    .selectSystemRole(Long.parseLong(request.pathVariable("id"))),
                SystemRole.class)
            .onErrorMap(e -> new ServerException("SystemRole deletion failed", e));

  }

}

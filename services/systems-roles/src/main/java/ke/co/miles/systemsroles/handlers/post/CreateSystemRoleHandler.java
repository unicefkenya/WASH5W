/*
 * Copyright (C) 2021 Second Mile
 *
 * This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0.
 * If a copy of the MPL was not distributed with this file,
 * You can obtain one at http://mozilla.org/MPL/2.0/.
 */
package ke.co.miles.systemsroles.handlers.post;

import ke.co.miles.systemsroles.exceptions.ServerException;
import ke.co.miles.systemsroles.models.SystemRole;
import ke.co.miles.systemsroles.repository.SystemsRolesRepository;
import ke.co.miles.systemsroles.util.builders.SystemRoleBuilder;
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
public class CreateSystemRoleHandler {

  @Autowired
  SystemsRolesRepository repository;

  /**
   * Creates a systemRole record
   *
   * @param request the request containing the details of the systemRole record to be created and the
   *                database within which it should be created
   * @return the response containing the details of the newly created systemRole record
   */
  public Mono<ServerResponse> createSystemRole(ServerRequest request) {

    log.trace("Entering createSystemRole()");

    return
        ServerResponse
            .status(HttpStatus.CREATED)
            .contentType(MediaType.APPLICATION_JSON)
            .body(
                request
                    .bodyToMono(SystemRole.class)
                    .flatMap(systemRole ->
                        repository
                            .insertSystemRole(systemRole)
                            .map(id ->
                                new SystemRoleBuilder()
                                    .id(id)
                                    .data(systemRole.getData())
                                    .version(1)
                                    .build())),
                SystemRole.class)
            .onErrorMap(e -> new ServerException("SystemRole creation failed", e));
  }


}

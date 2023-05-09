/*
 * Copyright (C) 2021 Second Mile
 *
 * This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0.
 * If a copy of the MPL was not distributed with this file,
 * You can obtain one at http://mozilla.org/MPL/2.0/.
 */
package ke.co.miles.systemsusers.handlers.put;

import ke.co.miles.systemsusers.exceptions.ServerException;
import ke.co.miles.systemsusers.models.SystemUser;
import ke.co.miles.systemsusers.repository.SystemsUsersRepository;
import ke.co.miles.systemsusers.util.builders.SystemUserBuilder;
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
public class UpdateSystemUserHandler {

  @Autowired
  SystemsUsersRepository repository;

  /**
   * Updates a systemUser record
   *
   * @param request the request containing the details of the systemUser record to be updated
   * @return the response containing the details of the newly updated systemUser record
   */
  public Mono<ServerResponse> updateSystemUser(ServerRequest request) {

    log.trace("Entering updateSystemUser()");

    return
        ServerResponse
            .status(HttpStatus.OK)
            .contentType(MediaType.APPLICATION_JSON)
            .body(
                request
                    .bodyToMono(SystemUser.class)
                    .flatMap(systemUser ->
                        repository
                            .updateSystemUser(systemUser)
                            .map(count ->
                                new SystemUserBuilder()
                                    .id(systemUser.getId())
                                    .data(systemUser.getData())
                                    .version(systemUser.getVersion() + 1)
                                    .build())),
                SystemUser.class)
            .onErrorMap(e -> new ServerException("SystemUser update failed", e));

  }

}

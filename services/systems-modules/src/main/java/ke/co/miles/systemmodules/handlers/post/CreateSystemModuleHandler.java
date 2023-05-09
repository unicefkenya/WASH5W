/*
 * Copyright (C) 2021 Second Mile
 *
 * This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0.
 * If a copy of the MPL was not distributed with this file,
 * You can obtain one at http://mozilla.org/MPL/2.0/.
 */
package ke.co.miles.systemmodules.handlers.post;

import ke.co.miles.systemmodules.exceptions.ServerException;
import ke.co.miles.systemmodules.models.SystemModule;
import ke.co.miles.systemmodules.repository.SystemsModulesRepository;
import ke.co.miles.systemmodules.util.builders.SystemModuleBuilder;
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
public class CreateSystemModuleHandler {

  @Autowired
  SystemsModulesRepository repository;

  /**
   * Creates a systemModule record
   *
   * @param request the request containing the details of the systemModule record to be created and the
   *                database within which it should be created
   * @return the response containing the details of the newly created systemModule record
   */
  public Mono<ServerResponse> createSystemModule(ServerRequest request) {

    log.trace("Entering createSystemModule()");

    return
        ServerResponse
            .status(HttpStatus.CREATED)
            .contentType(MediaType.APPLICATION_JSON)
            .body(
                request
                    .bodyToMono(SystemModule.class)
                    .flatMap(systemModule ->
                        repository
                            .insertSystemModule(systemModule)
                            .map(id ->
                                new SystemModuleBuilder()
                                    .id(id)
                                    .data(systemModule.getData())
                                    .version(1)
                                    .build())),
                SystemModule.class)
            .onErrorMap(e -> new ServerException("SystemModule creation failed", e));
  }


}

/*
 * Copyright (C) 2021 Second Mile
 *
 * This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0.
 * If a copy of the MPL was not distributed with this file,
 * You can obtain one at http://mozilla.org/MPL/2.0/.
 */
package ke.co.miles.logicalschemes.handlers.post;

import ke.co.miles.logicalschemes.exceptions.ServerException;
import ke.co.miles.logicalschemes.models.LogicalScheme;
import ke.co.miles.logicalschemes.repository.LogicalSchemesRepository;
import ke.co.miles.logicalschemes.util.builders.LogicalSchemeBuilder;
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
public class CreateLogicalSchemeHandler {

  @Autowired
  LogicalSchemesRepository repository;

  /**
   * Creates a logicalScheme record
   *
   * @param request the request containing the details of the logicalScheme record to be created and the
   *                database within which it should be created
   * @return the response containing the details of the newly created logicalScheme record
   */
  public Mono<ServerResponse> createLogicalScheme(ServerRequest request) {

    log.trace("Entering createLogicalScheme()");

    return
        ServerResponse
            .status(HttpStatus.CREATED)
            .contentType(MediaType.APPLICATION_JSON)
            .body(
                request
                    .bodyToMono(LogicalScheme.class)
                    .flatMap(logicalScheme ->
                        repository
                            .insertLogicalScheme(logicalScheme)
                            .map(id ->
                                new LogicalSchemeBuilder()
                                    .id(id)
                                    .data(logicalScheme.getData())
                                    .version(1)
                                    .build())),
                LogicalScheme.class)
            .onErrorMap(e -> new ServerException("LogicalScheme creation failed", e));
  }


}

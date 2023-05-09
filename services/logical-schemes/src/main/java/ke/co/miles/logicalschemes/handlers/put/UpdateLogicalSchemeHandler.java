/*
 * Copyright (C) 2021 Second Mile
 *
 * This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0.
 * If a copy of the MPL was not distributed with this file,
 * You can obtain one at http://mozilla.org/MPL/2.0/.
 */
package ke.co.miles.logicalschemes.handlers.put;

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
public class UpdateLogicalSchemeHandler {

  @Autowired
  LogicalSchemesRepository repository;

  /**
   * Updates a logicalScheme record
   *
   * @param request the request containing the details of the logicalScheme record to be updated
   * @return the response containing the details of the newly updated logicalScheme record
   */
  public Mono<ServerResponse> updateLogicalScheme(ServerRequest request) {

    log.trace("Entering updateLogicalScheme()");

    return
        ServerResponse
            .status(HttpStatus.OK)
            .contentType(MediaType.APPLICATION_JSON)
            .body(
                request
                    .bodyToMono(LogicalScheme.class)
                    .flatMap(logicalScheme ->
                        repository
                            .updateLogicalScheme(logicalScheme)
                            .map(count ->
                                new LogicalSchemeBuilder()
                                    .id(logicalScheme.getId())
                                    .data(logicalScheme.getData())
                                    .version(logicalScheme.getVersion() + 1)
                                    .build())),
                LogicalScheme.class)
            .onErrorMap(e -> new ServerException("LogicalScheme update failed", e));

  }

}

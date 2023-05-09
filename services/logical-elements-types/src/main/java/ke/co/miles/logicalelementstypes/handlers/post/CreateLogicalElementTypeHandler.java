/*
 * Copyright (C) 2021 Second Mile
 *
 * This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0.
 * If a copy of the MPL was not distributed with this file,
 * You can obtain one at http://mozilla.org/MPL/2.0/.
 */
package ke.co.miles.logicalelementstypes.handlers.post;

import ke.co.miles.logicalelementstypes.exceptions.ServerException;
import ke.co.miles.logicalelementstypes.models.LogicalElementType;
import ke.co.miles.logicalelementstypes.repository.LogicalElementsTypesRepository;
import ke.co.miles.logicalelementstypes.util.builders.LogicalElementTypeBuilder;
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
public class CreateLogicalElementTypeHandler {

  @Autowired
  LogicalElementsTypesRepository repository;

  /**
   * Creates a logicalElementType record
   *
   * @param request the request containing the details of the logicalElementType record to be created and the
   *                database within which it should be created
   * @return the response containing the details of the newly created logicalElementType record
   */
  public Mono<ServerResponse> createLogicalElementType(ServerRequest request) {

    log.trace("Entering createLogicalElementType()");

    return
        ServerResponse
            .status(HttpStatus.CREATED)
            .contentType(MediaType.APPLICATION_JSON)
            .body(
                request
                    .bodyToMono(LogicalElementType.class)
                    .flatMap(logicalElementType ->
                        repository
                            .insertLogicalElementType(logicalElementType)
                            .map(id ->
                                new LogicalElementTypeBuilder()
                                    .id(id)
                                    .data(logicalElementType.getData())
                                    .version(1)
                                    .build())),
                LogicalElementType.class)
            .onErrorMap(e -> new ServerException("LogicalElementType creation failed", e));
  }


}

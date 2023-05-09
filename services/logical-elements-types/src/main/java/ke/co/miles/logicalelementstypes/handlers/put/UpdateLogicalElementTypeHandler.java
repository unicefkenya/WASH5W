/*
 * Copyright (C) 2021 Second Mile
 *
 * This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0.
 * If a copy of the MPL was not distributed with this file,
 * You can obtain one at http://mozilla.org/MPL/2.0/.
 */
package ke.co.miles.logicalelementstypes.handlers.put;

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
public class UpdateLogicalElementTypeHandler {

  @Autowired
  LogicalElementsTypesRepository repository;

  /**
   * Updates a logicalElementType record
   *
   * @param request the request containing the details of the logicalElementType record to be updated
   * @return the response containing the details of the newly updated logicalElementType record
   */
  public Mono<ServerResponse> updateLogicalElementType(ServerRequest request) {

    log.trace("Entering updateLogicalElementType()");

    return
        ServerResponse
            .status(HttpStatus.OK)
            .contentType(MediaType.APPLICATION_JSON)
            .body(
                request
                    .bodyToMono(LogicalElementType.class)
                    .flatMap(logicalElementType ->
                        repository
                            .updateLogicalElementType(logicalElementType)
                            .map(count ->
                                new LogicalElementTypeBuilder()
                                    .id(logicalElementType.getId())
                                    .data(logicalElementType.getData())
                                    .version(logicalElementType.getVersion() + 1)
                                    .build())),
                LogicalElementType.class)
            .onErrorMap(e -> new ServerException("LogicalElementType update failed", e));

  }

}

/*
 * Copyright (C) 2021 Second Mile
 *
 * This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0.
 * If a copy of the MPL was not distributed with this file,
 * You can obtain one at http://mozilla.org/MPL/2.0/.
 */
package ke.co.miles.logicalhierarchies.handlers.post;

import ke.co.miles.logicalhierarchies.exceptions.ServerException;
import ke.co.miles.logicalhierarchies.models.LogicalHierarchy;
import ke.co.miles.logicalhierarchies.repository.LogicalHierarchiesRepository;
import ke.co.miles.logicalhierarchies.util.builders.LogicalHierarchyBuilder;
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
public class CreateLogicalHierarchyHandler {

  @Autowired
  LogicalHierarchiesRepository repository;

  /**
   * Creates a logicalHierarchy record
   *
   * @param request the request containing the details of the logicalHierarchy record to be created and the
   *                database within which it should be created
   * @return the response containing the details of the newly created logicalHierarchy record
   */
  public Mono<ServerResponse> createLogicalHierarchy(ServerRequest request) {

    log.trace("Entering createLogicalHierarchy()");

    return
        ServerResponse
            .status(HttpStatus.CREATED)
            .contentType(MediaType.APPLICATION_JSON)
            .body(
                request
                    .bodyToMono(LogicalHierarchy.class)
                    .flatMap(logicalHierarchy ->
                        repository
                            .insertLogicalHierarchy(logicalHierarchy)
                            .map(id ->
                                new LogicalHierarchyBuilder()
                                    .id(id)
                                    .data(logicalHierarchy.getData())
                                    .version(1)
                                    .build())),
                LogicalHierarchy.class)
            .onErrorMap(e -> new ServerException("LogicalHierarchy creation failed", e));
  }


}

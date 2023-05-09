/*
 * Copyright (C) 2021 Second Mile
 *
 * This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0.
 * If a copy of the MPL was not distributed with this file,
 * You can obtain one at http://mozilla.org/MPL/2.0/.
 */
package ke.co.miles.logicalelements.handlers.post;

import ke.co.miles.logicalelements.exceptions.ServerException;
import ke.co.miles.logicalelements.models.LogicalElement;
import ke.co.miles.logicalelements.repository.LogicalElementsRepository;
import ke.co.miles.logicalelements.util.builders.LogicalElementBuilder;
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
public class CreateLogicalElementHandler {

  @Autowired
  LogicalElementsRepository repository;

  /**
   * Creates a logicalElement record
   *
   * @param request the request containing the details of the logicalElement record to be created and the
   *                database within which it should be created
   * @return the response containing the details of the newly created logicalElement record
   */
  public Mono<ServerResponse> createLogicalElement(ServerRequest request) {

    log.trace("Entering createLogicalElement()");

    return
        ServerResponse
            .status(HttpStatus.CREATED)
            .contentType(MediaType.APPLICATION_JSON)
            .body(
                request
                    .bodyToMono(LogicalElement.class)
                    .flatMap(logicalElement ->
                        repository
                            .insertLogicalElement(logicalElement)
                            .map(id ->
                                new LogicalElementBuilder()
                                    .id(id)
                                    .data(logicalElement.getData())
                                    .version(1)
                                    .build())),
                LogicalElement.class)
            .onErrorMap(e -> new ServerException("LogicalElement creation failed", e));
  }


}

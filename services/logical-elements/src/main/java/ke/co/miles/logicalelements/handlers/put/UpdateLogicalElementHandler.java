/*
 * Copyright (C) 2021 Second Mile
 *
 * This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0.
 * If a copy of the MPL was not distributed with this file,
 * You can obtain one at http://mozilla.org/MPL/2.0/.
 */
package ke.co.miles.logicalelements.handlers.put;

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
public class UpdateLogicalElementHandler {

  @Autowired
  LogicalElementsRepository repository;

  /**
   * Updates a logicalElement record
   *
   * @param request the request containing the details of the logicalElement record to be updated
   * @return the response containing the details of the newly updated logicalElement record
   */
  public Mono<ServerResponse> updateLogicalElement(ServerRequest request) {

    log.trace("Entering updateLogicalElement()");

    return
        ServerResponse
            .status(HttpStatus.OK)
            .contentType(MediaType.APPLICATION_JSON)
            .body(
                request
                    .bodyToMono(LogicalElement.class)
                    .flatMap(logicalElement ->
                        repository
                            .updateLogicalElement(logicalElement)
                            .map(count ->
                                new LogicalElementBuilder()
                                    .id(logicalElement.getId())
                                    .data(logicalElement.getData())
                                    .version(logicalElement.getVersion() + 1)
                                    .build())),
                LogicalElement.class)
            .onErrorMap(e -> new ServerException("LogicalElement update failed", e));

  }

}

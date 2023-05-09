/*
 * Copyright (C) 2021 Second Mile
 *
 * This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0.
 * If a copy of the MPL was not distributed with this file,
 * You can obtain one at http://mozilla.org/MPL/2.0/.
 */
package ke.co.miles.contexts.handlers.put;

import ke.co.miles.contexts.exceptions.ServerException;
import ke.co.miles.contexts.models.Context;
import ke.co.miles.contexts.repository.ContextsRepository;
import ke.co.miles.contexts.util.builders.ContextBuilder;
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
public class UpdateContextHandler {

  @Autowired
  ContextsRepository repository;

  /**
   * Updates a context record
   *
   * @param request the request containing the details of the context record to be updated
   * @return the response containing the details of the newly updated context record
   */
  public Mono<ServerResponse> updateContext(ServerRequest request) {

    log.trace("Entering updateContext()");

    return
        ServerResponse
            .status(HttpStatus.OK)
            .contentType(MediaType.APPLICATION_JSON)
            .body(
                request
                    .bodyToMono(Context.class)
                    .flatMap(context ->
                        repository
                            .updateContext(context)
                            .map(count ->
                                new ContextBuilder()
                                    .id(context.getId())
                                    .data(context.getData())
                                    .version(context.getVersion() + 1)
                                    .build())),
                Context.class)
            .onErrorMap(e -> new ServerException("Context update failed", e));

  }

}

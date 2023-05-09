/*
 * Copyright (C) 2021 Second Mile
 *
 * This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0.
 * If a copy of the MPL was not distributed with this file,
 * You can obtain one at http://mozilla.org/MPL/2.0/.
 */
package ke.co.miles.contexts.handlers.post;

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
public class CreateContextHandler {

  @Autowired
  ContextsRepository repository;

  /**
   * Creates a context record
   *
   * @param request the request containing the details of the context record to be created and the
   *                database within which it should be created
   * @return the response containing the details of the newly created context record
   */
  public Mono<ServerResponse> createContext(ServerRequest request) {

    log.trace("Entering createContext()");

    return
        ServerResponse
            .status(HttpStatus.CREATED)
            .contentType(MediaType.APPLICATION_JSON)
            .body(
                request
                    .bodyToMono(Context.class)
                    .flatMap(context ->
                        repository
                            .insertContext(context)
                            .map(id ->
                                new ContextBuilder()
                                    .id(id)
                                    .data(context.getData())
                                    .version(1)
                                    .build())),
                Context.class)
            .onErrorMap(e -> new ServerException("Context creation failed", e));
  }


}

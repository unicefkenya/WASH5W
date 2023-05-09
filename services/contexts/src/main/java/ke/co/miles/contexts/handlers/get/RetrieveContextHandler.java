/*
 * Copyright (C) 2021 Second Mile
 *
 * This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0.
 * If a copy of the MPL was not distributed with this file,
 * You can obtain one at http://mozilla.org/MPL/2.0/.
 */
package ke.co.miles.contexts.handlers.get;

import ke.co.miles.contexts.exceptions.ServerException;
import ke.co.miles.contexts.models.Context;
import ke.co.miles.contexts.repository.ContextsRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
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
public class RetrieveContextHandler {

  @Autowired
  ContextsRepository repository;

  /**
   * Retrieves a context record given its unique identifier
   *
   * @param request the request containing the unique identifier of the context record to be
   *                retrieved and the database from which it should be retrieved
   * @return the response containing the details of the retrieved context record
   */
  public Mono<ServerResponse> retrieveContext(ServerRequest request) {

    log.trace("Entering retrieveContext()");

    return
        ServerResponse
            .ok()
            .contentType(MediaType.APPLICATION_JSON)
            .body(
                repository
                    .selectContext(Long.parseLong(request.pathVariable("id"))),
                Context.class)
            .onErrorMap(e -> new ServerException("Context deletion failed", e));

  }

}

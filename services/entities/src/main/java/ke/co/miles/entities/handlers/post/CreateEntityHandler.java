/*
 * Copyright (C) 2021 Second Mile
 *
 * This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0.
 * If a copy of the MPL was not distributed with this file,
 * You can obtain one at http://mozilla.org/MPL/2.0/.
 */
package ke.co.miles.entities.handlers.post;

import ke.co.miles.entities.exceptions.ServerException;
import ke.co.miles.entities.models.Entity;
import ke.co.miles.entities.repository.EntitiesRepository;
import ke.co.miles.entities.util.builders.EntityBuilder;
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
public class CreateEntityHandler {

  @Autowired
  EntitiesRepository repository;

  /**
   * Creates an entity record
   *
   * @param request the request containing the details of the entity record to be created and the
   *                database within which it should be created
   * @return the response containing the details of the newly created entity record
   */
  public Mono<ServerResponse> createEntity(ServerRequest request) {

    log.trace("Entering createEntity()");

    return
        ServerResponse
            .status(HttpStatus.CREATED)
            .contentType(MediaType.APPLICATION_JSON)
            .body(
                request
                    .bodyToMono(Entity.class)
                    .flatMap(entity ->
                        repository
                            .insertEntity(
                                request.pathVariable("database"),
                                entity)
                            .map(id ->
                                new EntityBuilder()
                                    .id(id)
                                    .data(entity.getData())
                                    .version(1)
                                    .build())),
                Entity.class)
            .onErrorMap(e -> new ServerException("Entity creation failed", e));
  }


}

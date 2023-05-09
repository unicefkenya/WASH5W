/*
 * Copyright (C) 2021 Second Mile
 *
 * This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0.
 * If a copy of the MPL was not distributed with this file,
 * You can obtain one at http://mozilla.org/MPL/2.0/.
 */
package ke.co.miles.entities.handlers.put;

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
public class UpdateEntityHandler {

  @Autowired
  EntitiesRepository repository;

  /**
   * Updates an entity record
   *
   * @param request the request containing the details of the entity record to be updated
   * @return the response containing the details of the newly updated entity record
   */
  public Mono<ServerResponse> updateEntity(ServerRequest request) {

    log.trace("Entering updateEntity()");

    return
        ServerResponse
            .status(HttpStatus.OK)
            .contentType(MediaType.APPLICATION_JSON)
            .body(
                request
                    .bodyToMono(Entity.class)
                    .flatMap(entity ->
                        repository
                            .updateEntity(
                                request.pathVariable("database"),
                                entity)
                            .map(count ->
                                new EntityBuilder()
                                    .id(entity.getId())
                                    .data(entity.getData())
                                    .version(entity.getVersion() + 1)
                                    .build())),
                Entity.class)
            .onErrorMap(e -> new ServerException("Entity update failed", e));

  }

}

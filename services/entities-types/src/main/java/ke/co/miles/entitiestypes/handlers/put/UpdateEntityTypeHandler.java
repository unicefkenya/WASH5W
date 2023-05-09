/*
 * Copyright (C) 2021 Second Mile
 *
 * This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0.
 * If a copy of the MPL was not distributed with this file,
 * You can obtain one at http://mozilla.org/MPL/2.0/.
 */
package ke.co.miles.entitiestypes.handlers.put;

import ke.co.miles.entitiestypes.exceptions.ServerException;
import ke.co.miles.entitiestypes.models.EntityType;
import ke.co.miles.entitiestypes.repository.EntitiesTypesRepository;
import ke.co.miles.entitiestypes.util.builders.EntityTypeBuilder;
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
public class UpdateEntityTypeHandler {

  @Autowired
  EntitiesTypesRepository repository;

  /**
   * Updates a entityType record
   *
   * @param request the request containing the details of the entityType record to be updated
   * @return the response containing the details of the newly updated entityType record
   */
  public Mono<ServerResponse> updateEntityType(ServerRequest request) {

    log.trace("Entering updateEntityType()");

    return
        ServerResponse
            .status(HttpStatus.OK)
            .contentType(MediaType.APPLICATION_JSON)
            .body(
                request
                    .bodyToMono(EntityType.class)
                    .flatMap(entityType ->
                        repository
                            .updateEntityType(entityType)
                            .map(count ->
                                new EntityTypeBuilder()
                                    .id(entityType.getId())
                                    .data(entityType.getData())
                                    .version(entityType.getVersion() + 1)
                                    .build())),
                EntityType.class)
            .onErrorMap(e -> new ServerException("EntityType update failed", e));

  }

}

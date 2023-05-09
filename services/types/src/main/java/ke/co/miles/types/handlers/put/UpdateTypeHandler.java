/*
 * Copyright (C) 2021 Second Mile
 *
 * This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0.
 * If a copy of the MPL was not distributed with this file,
 * You can obtain one at http://mozilla.org/MPL/2.0/.
 */
package ke.co.miles.types.handlers.put;

import ke.co.miles.types.exceptions.ServerException;
import ke.co.miles.types.models.Type;
import ke.co.miles.types.repository.TypesRepository;
import ke.co.miles.types.util.builders.TypeBuilder;
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
public class UpdateTypeHandler {

    @Autowired
    TypesRepository repository;

    /**
     * Updates an type record
     *
     * @param request the request containing the details of the type record to be updated
     * @return the response containing the details of the newly updated type record
     */
    public Mono<ServerResponse> updateType(ServerRequest request) {

        log.trace("Entering updateType()");

        return
                ServerResponse
                        .status(HttpStatus.OK)
                        .contentType(MediaType.APPLICATION_JSON)
                        .body(
                                request
                                        .bodyToMono(Type.class)
                                        .flatMap(type ->
                                                repository
                                                        .updateType(
                                                                request.pathVariable("database"),
                                                                type)
                                                        .map(count ->
                                                                new TypeBuilder()
                                                                        .id(type.getId())
                                                                        .data(type.getData())
                                                                        .version(type.getVersion() + 1)
                                                                        .build())),
                                Type.class)
                        .onErrorMap(e -> new ServerException("Type update failed", e));

    }

}

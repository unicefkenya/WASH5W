/*
 * Copyright (C) 2021 Second Mile
 *
 * This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0.
 * If a copy of the MPL was not distributed with this file,
 * You can obtain one at http://mozilla.org/MPL/2.0/.
 */
package ke.co.miles.types.handlers.delete;

import ke.co.miles.types.exceptions.ServerException;
import ke.co.miles.types.repository.TypesRepository;
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
public class DeleteTypeHandler {

    @Autowired
    TypesRepository repository;

    /**
     * Deletes an type record
     *
     * @param request the request containing the details of the type record to be deleted and the database from
     *                which it should be deleted
     * @return the response containing the number of types records deleted
     */
    public Mono<ServerResponse> deleteType(ServerRequest request) {

        log.trace("Entering deleteType()");

        return
                ServerResponse
                        .ok()
                        .contentType(MediaType.APPLICATION_JSON)
                        .body(
                                repository
                                        .deleteTypeById(
                                                request.pathVariable("database"),
                                                Long.parseLong(request.pathVariable("id"))),
                                Integer.class)
                        .onErrorMap(e -> new ServerException("Type deletion failed", e));
    }

}

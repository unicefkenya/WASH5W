/*
 * Copyright (C) 2021 Second Mile
 *
 * This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0.
 * If a copy of the MPL was not distributed with this file,
 * You can obtain one at http://mozilla.org/MPL/2.0/.
 */
package ke.co.miles.types.handlers.get;

import ke.co.miles.types.exceptions.ServerException;
import ke.co.miles.types.models.Type;
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
public class RetrieveTypesHandler {

    @Autowired
    TypesRepository repository;

    /**
     * Retrieves all Types or specific Types if given their unique identifiers
     *
     * @param request the request, optionally containing the query filters of the types records to be retrieved
     *                and the database from which they should be retrieved
     *
     * @return the stream of responses containing the details of the retrieved types records
     */
    public Mono<ServerResponse> retrieveTypes(ServerRequest request) {

        log.trace("Entering retrieveTypes()");

        return
                ServerResponse
                        .ok()
                        .contentType(MediaType.APPLICATION_JSON)
                        .body(
                                repository
                                        .selectTypes(
                                                request.pathVariable("database"),
                                                request.queryParams()),
                                Type.class)
                        .onErrorMap(e -> new ServerException("Type deletion failed", e));
    }


}

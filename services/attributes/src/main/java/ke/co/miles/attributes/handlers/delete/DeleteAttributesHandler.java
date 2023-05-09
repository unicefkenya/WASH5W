/*
 * Copyright (C) 2021 Second Mile
 *
 * This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0.
 * If a copy of the MPL was not distributed with this file,
 * You can obtain one at http://mozilla.org/MPL/2.0/.
 */
package ke.co.miles.attributes.handlers.delete;

import ke.co.miles.attributes.exceptions.ServerException;
import ke.co.miles.attributes.repository.AttributesRepository;
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
public class DeleteAttributesHandler {

    @Autowired
    AttributesRepository repository;

    /**
     * Deletes all Attributes or specific attributes records if given their unique identifiers
     *
     * @param request the request, optionally containing the unique identifiers of the attributes records to be deleted
     *               and the database from which they should be deleted
     *
     * @return the response containing the number of attributes records deleted
     */
    public Mono<ServerResponse> deleteAttributes(ServerRequest request) {

        log.trace("Entering deleteAttributes()");

        return
                ServerResponse
                        .ok()
                        .contentType(MediaType.APPLICATION_JSON)
                        .body(
                                repository
                                        .deleteAttributes(
                                                request.pathVariable("database"),
                                                request.queryParams()),
                                Integer.class)
                        .onErrorMap(e -> new ServerException("Attribute deletion failed", e));

    }

}

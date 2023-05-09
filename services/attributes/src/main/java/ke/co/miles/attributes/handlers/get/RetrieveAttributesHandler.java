/*
 * Copyright (C) 2021 Second Mile
 *
 * This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0.
 * If a copy of the MPL was not distributed with this file,
 * You can obtain one at http://mozilla.org/MPL/2.0/.
 */
package ke.co.miles.attributes.handlers.get;

import ke.co.miles.attributes.exceptions.ServerException;
import ke.co.miles.attributes.models.Attribute;
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
public class RetrieveAttributesHandler {

    @Autowired
    AttributesRepository repository;

    /**
     * Retrieves all Attributes or specific Attributes if given their unique identifiers
     *
     * @param request the request, optionally containing the query filters of the attributes records to be retrieved
     *                and the database from which they should be retrieved
     *
     * @return the stream of responses containing the details of the retrieved attributes records
     */
    public Mono<ServerResponse> retrieveAttributes(ServerRequest request) {

        log.trace("Entering retrieveAttributes()");

        return
                ServerResponse
                        .ok()
                        .contentType(MediaType.APPLICATION_JSON)
                        .body(
                                repository
                                        .selectAttributes(
                                                request.pathVariable("database"),
                                                request.queryParams()),
                                Attribute.class)
                        .onErrorMap(e -> new ServerException("Attribute deletion failed", e));
    }


}

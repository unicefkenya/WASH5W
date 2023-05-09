/*
 * Copyright (C) 2021 Second Mile
 *
 * This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0.
 * If a copy of the MPL was not distributed with this file,
 * You can obtain one at http://mozilla.org/MPL/2.0/.
 */
package ke.co.miles.groups.handlers.get;

import ke.co.miles.groups.exceptions.ServerException;
import ke.co.miles.groups.repository.GroupsRepository;
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
public class RetrieveTotalGroupsHandler {

    @Autowired
    GroupsRepository repository;

    /**
     * Retrieves the total number of groups records to be retrieved, or an estimate of the total number of
     * groups records to be retrieved - if the cost of retrieving the former is greater than the acceptable
     * threshold
     *
     * @param request the request, optionally containing query filters of the groups records to be retrieved and
     *                the database from which it should be retrieved
     *
     * @return the response containing the total number of groups records to be retrieved
     */
    public Mono<ServerResponse> retrieveTotalGroups(ServerRequest request) {

        log.trace("Entering retrieveTotalGroups()");

        return
                ServerResponse
                        .ok()
                        .contentType(MediaType.APPLICATION_JSON)
                        .body(
                                repository
                                        .selectTotalGroups(
                                                request.pathVariable("database"),
                                                request.queryParams()),
                                Long.class)
                        .onErrorMap(e -> new ServerException("Total Groups retrieval failed", e));
    }

}

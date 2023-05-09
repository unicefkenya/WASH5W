/*
 * Copyright (C) 2021 Second Mile
 *
 * This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0.
 * If a copy of the MPL was not distributed with this file,
 * You can obtain one at http://mozilla.org/MPL/2.0/.
 */
package ke.co.miles.statuses.handlers.put;

import ke.co.miles.statuses.exceptions.ServerException;
import ke.co.miles.statuses.models.Status;
import ke.co.miles.statuses.repository.StatusesRepository;
import ke.co.miles.statuses.util.builders.StatusBuilder;
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
public class UpdateStatusHandler {

    @Autowired
    StatusesRepository repository;

    /**
     * Updates an status record
     *
     * @param request the request containing the details of the status record to be updated
     * @return the response containing the details of the newly updated status record
     */
    public Mono<ServerResponse> updateStatus(ServerRequest request) {

        log.trace("Entering updateStatus()");

        return
                ServerResponse
                        .status(HttpStatus.OK)
                        .contentType(MediaType.APPLICATION_JSON)
                        .body(
                                request
                                        .bodyToMono(Status.class)
                                        .flatMap(status ->
                                                repository
                                                        .updateStatus(
                                                                request.pathVariable("database"),
                                                                status)
                                                        .map(count ->
                                                                new StatusBuilder()
                                                                        .id(status.getId())
                                                                        .data(status.getData())
                                                                        .version(status.getVersion() + 1)
                                                                        .build())),
                                Status.class)
                        .onErrorMap(e -> new ServerException("Status update failed", e));

    }

}

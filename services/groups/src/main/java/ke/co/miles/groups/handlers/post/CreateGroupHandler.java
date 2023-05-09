/*
 * Copyright (C) 2021 Second Mile
 *
 * This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0.
 * If a copy of the MPL was not distributed with this file,
 * You can obtain one at http://mozilla.org/MPL/2.0/.
 */
package ke.co.miles.groups.handlers.post;

import ke.co.miles.groups.exceptions.ServerException;
import ke.co.miles.groups.models.Group;
import ke.co.miles.groups.repository.GroupsRepository;
import ke.co.miles.groups.util.builders.GroupBuilder;
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
public class CreateGroupHandler {

    @Autowired
    GroupsRepository repository;

    /**
     * Creates an group record
     *
     * @param request the request containing the details of the group record to be created and the
     *                database within which it should be created
     * @return the response containing the details of the newly created group record
     */
    public Mono<ServerResponse> createGroup(ServerRequest request) {

        log.trace("Entering createGroup()");

        return
                ServerResponse
                        .status(HttpStatus.CREATED)
                        .contentType(MediaType.APPLICATION_JSON)
                        .body(
                                request
                                        .bodyToMono(Group.class)
                                        .flatMap(group ->
                                                        repository
                                                                .insertGroup(
                                                                        request.pathVariable("database"),
                                                                        group)
                                                                .map(id ->
                                                                        new GroupBuilder()
                                                                                .id(id)
                                                                                .data(group.getData())
                                                                                .version(1)
                                                                                .build())),
                                Group.class)
                        .onErrorMap(e -> new ServerException("Group creation failed", e));
    }


}

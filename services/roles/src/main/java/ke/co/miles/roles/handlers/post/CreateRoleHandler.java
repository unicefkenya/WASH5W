/*
 * Copyright (C) 2021 Second Mile
 *
 * This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0.
 * If a copy of the MPL was not distributed with this file,
 * You can obtain one at http://mozilla.org/MPL/2.0/.
 */
package ke.co.miles.roles.handlers.post;

import ke.co.miles.roles.exceptions.ServerException;
import ke.co.miles.roles.models.Role;
import ke.co.miles.roles.repository.RolesRepository;
import ke.co.miles.roles.util.builders.RoleBuilder;
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
public class CreateRoleHandler {

    @Autowired
    RolesRepository repository;

    /**
     * Creates an role record
     *
     * @param request the request containing the details of the role record to be created and the
     *                database within which it should be created
     * @return the response containing the details of the newly created role record
     */
    public Mono<ServerResponse> createRole(ServerRequest request) {

        log.trace("Entering createRole()");

        return
                ServerResponse
                        .status(HttpStatus.CREATED)
                        .contentType(MediaType.APPLICATION_JSON)
                        .body(
                                request
                                        .bodyToMono(Role.class)
                                        .flatMap(role ->
                                                        repository
                                                                .insertRole(
                                                                        request.pathVariable("database"),
                                                                        role)
                                                                .map(id ->
                                                                        new RoleBuilder()
                                                                                .id(id)
                                                                                .data(role.getData())
                                                                                .version(1)
                                                                                .build())),
                                Role.class)
                        .onErrorMap(e -> new ServerException("Role creation failed", e));
    }


}

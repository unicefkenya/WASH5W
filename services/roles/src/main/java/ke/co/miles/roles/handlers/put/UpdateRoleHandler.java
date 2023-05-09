/*
 * Copyright (C) 2021 Second Mile
 *
 * This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0.
 * If a copy of the MPL was not distributed with this file,
 * You can obtain one at http://mozilla.org/MPL/2.0/.
 */
package ke.co.miles.roles.handlers.put;

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
public class UpdateRoleHandler {

    @Autowired
    RolesRepository repository;

    /**
     * Updates an role record
     *
     * @param request the request containing the details of the role record to be updated
     * @return the response containing the details of the newly updated role record
     */
    public Mono<ServerResponse> updateRole(ServerRequest request) {

        log.trace("Entering updateRole()");

        return
                ServerResponse
                        .status(HttpStatus.OK)
                        .contentType(MediaType.APPLICATION_JSON)
                        .body(
                                request
                                        .bodyToMono(Role.class)
                                        .flatMap(role ->
                                                repository
                                                        .updateRole(
                                                                request.pathVariable("database"),
                                                                role)
                                                        .map(count ->
                                                                new RoleBuilder()
                                                                        .id(role.getId())
                                                                        .data(role.getData())
                                                                        .version(role.getVersion() + 1)
                                                                        .build())),
                                Role.class)
                        .onErrorMap(e -> new ServerException("Role update failed", e));

    }

}

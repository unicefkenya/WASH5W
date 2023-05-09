/*
 * Copyright (C) 2021 Second Mile
 *
 * This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0.
 * If a copy of the MPL was not distributed with this file,
 * You can obtain one at http://mozilla.org/MPL/2.0/.
 */
package ke.co.miles.levels.handlers.post;

import ke.co.miles.levels.exceptions.ServerException;
import ke.co.miles.levels.models.Level;
import ke.co.miles.levels.repository.LevelsRepository;
import ke.co.miles.levels.util.builders.LevelBuilder;
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
public class CreateLevelHandler {

    @Autowired
    LevelsRepository repository;

    /**
     * Creates an level record
     *
     * @param request the request containing the details of the level record to be created and the
     *                database within which it should be created
     * @return the response containing the details of the newly created level record
     */
    public Mono<ServerResponse> createLevel(ServerRequest request) {

        log.trace("Entering createLevel()");

        return
                ServerResponse
                        .status(HttpStatus.CREATED)
                        .contentType(MediaType.APPLICATION_JSON)
                        .body(
                                request
                                        .bodyToMono(Level.class)
                                        .flatMap(level ->
                                                        repository
                                                                .insertLevel(
                                                                        request.pathVariable("database"),
                                                                        level)
                                                                .map(id ->
                                                                        new LevelBuilder()
                                                                                .id(id)
                                                                                .data(level.getData())
                                                                                .version(1)
                                                                                .build())),
                                Level.class)
                        .onErrorMap(e -> new ServerException("Level creation failed", e));
    }


}

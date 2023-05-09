/*
 * Copyright (C) 2021 Second Mile
 *
 * This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0.
 * If a copy of the MPL was not distributed with this file,
 * You can obtain one at http://mozilla.org/MPL/2.0/.
 */
package ke.co.miles.levels.handlers.put;

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
public class UpdateLevelHandler {

    @Autowired
    LevelsRepository repository;

    /**
     * Updates an level record
     *
     * @param request the request containing the details of the level record to be updated
     * @return the response containing the details of the newly updated level record
     */
    public Mono<ServerResponse> updateLevel(ServerRequest request) {

        log.trace("Entering updateLevel()");

        return
                ServerResponse
                        .status(HttpStatus.OK)
                        .contentType(MediaType.APPLICATION_JSON)
                        .body(
                                request
                                        .bodyToMono(Level.class)
                                        .flatMap(level ->
                                                repository
                                                        .updateLevel(
                                                                request.pathVariable("database"),
                                                                level)
                                                        .map(count ->
                                                                new LevelBuilder()
                                                                        .id(level.getId())
                                                                        .data(level.getData())
                                                                        .version(level.getVersion() + 1)
                                                                        .build())),
                                Level.class)
                        .onErrorMap(e -> new ServerException("Level update failed", e));

    }

}

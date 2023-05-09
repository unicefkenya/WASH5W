/*
 * Copyright (C) 2021 Second Mile
 *
 * This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0.
 * If a copy of the MPL was not distributed with this file,
 * You can obtain one at http://mozilla.org/MPL/2.0/.
 */
package ke.co.miles.options.handlers.post;

import ke.co.miles.options.exceptions.ServerException;
import ke.co.miles.options.models.Option;
import ke.co.miles.options.repository.OptionsRepository;
import ke.co.miles.options.util.builders.OptionBuilder;
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
public class CreateOptionHandler {

  @Autowired
  OptionsRepository repository;

  /**
   * Creates a option record
   *
   * @param request the request containing the details of the option record to be created and the
   *                database within which it should be created
   * @return the response containing the details of the newly created option record
   */
  public Mono<ServerResponse> createOption(ServerRequest request) {

    log.trace("Entering createOption()");

    return
        ServerResponse
            .status(HttpStatus.CREATED)
            .contentType(MediaType.APPLICATION_JSON)
            .body(
                request
                    .bodyToMono(Option.class)
                    .flatMap(option ->
                        repository
                            .insertOption(option)
                            .map(id ->
                                new OptionBuilder()
                                    .id(id)
                                    .data(option.getData())
                                    .version(1)
                                    .build())),
                Option.class)
            .onErrorMap(e -> new ServerException("Option creation failed", e));
  }


}

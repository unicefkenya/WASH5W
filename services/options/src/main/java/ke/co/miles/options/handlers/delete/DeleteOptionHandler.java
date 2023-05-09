/*
 * Copyright (C) 2021 Second Mile
 *
 * This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0.
 * If a copy of the MPL was not distributed with this file,
 * You can obtain one at http://mozilla.org/MPL/2.0/.
 */
package ke.co.miles.options.handlers.delete;

import ke.co.miles.options.exceptions.ServerException;
import ke.co.miles.options.repository.OptionsRepository;
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
public class DeleteOptionHandler {

  @Autowired
  OptionsRepository repository;

  /**
   * Deletes a option record
   *
   * @param request the request containing the details of the option record to be deleted and the
   *                database from which it should be deleted
   * @return the response containing the number of options records deleted
   */
  public Mono<ServerResponse> deleteOption(ServerRequest request) {

    log.trace("Entering deleteOption()");

    return
        ServerResponse
            .ok()
            .contentType(MediaType.APPLICATION_JSON)
            .body(
                repository
                    .deleteOptionById(Long.parseLong(request.pathVariable("id"))),
                Integer.class)
            .onErrorMap(e -> new ServerException("Option deletion failed", e));
  }

}

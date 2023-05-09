/*
 * Copyright (C) 2021 Second Mile
 *
 * This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0.
 * If a copy of the MPL was not distributed with this file,
 * You can obtain one at http://mozilla.org/MPL/2.0/.
 */
package ke.co.miles.optionstypes.handlers.get;

import ke.co.miles.optionstypes.exceptions.ServerException;
import ke.co.miles.optionstypes.models.OptionType;
import ke.co.miles.optionstypes.repository.OptionsTypesRepository;
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
public class RetrieveOptionTypeHandler {

  @Autowired
  OptionsTypesRepository repository;

  /**
   * Retrieves a optionType record given its unique identifier
   *
   * @param request the request containing the unique identifier of the optionType record to be
   *                retrieved and the database from which it should be retrieved
   * @return the response containing the details of the retrieved optionType record
   */
  public Mono<ServerResponse> retrieveOptionType(ServerRequest request) {

    log.trace("Entering retrieveOptionType()");

    return
        ServerResponse
            .ok()
            .contentType(MediaType.APPLICATION_JSON)
            .body(
                repository
                    .selectOptionType(Long.parseLong(request.pathVariable("id"))),
                OptionType.class)
            .onErrorMap(e -> new ServerException("OptionType deletion failed", e));

  }

}

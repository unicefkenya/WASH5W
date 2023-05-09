/*
 * Copyright (C) 2021 Second Mile
 *
 * This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0.
 * If a copy of the MPL was not distributed with this file,
 * You can obtain one at http://mozilla.org/MPL/2.0/.
 */
package ke.co.miles.optionstypes.handlers.put;

import ke.co.miles.optionstypes.exceptions.ServerException;
import ke.co.miles.optionstypes.models.OptionType;
import ke.co.miles.optionstypes.repository.OptionsTypesRepository;
import ke.co.miles.optionstypes.util.builders.OptionTypeBuilder;
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
public class UpdateOptionTypeHandler {

  @Autowired
  OptionsTypesRepository repository;

  /**
   * Updates a optionType record
   *
   * @param request the request containing the details of the optionType record to be updated
   * @return the response containing the details of the newly updated optionType record
   */
  public Mono<ServerResponse> updateOptionType(ServerRequest request) {

    log.trace("Entering updateOptionType()");

    return
        ServerResponse
            .status(HttpStatus.OK)
            .contentType(MediaType.APPLICATION_JSON)
            .body(
                request
                    .bodyToMono(OptionType.class)
                    .flatMap(optionType ->
                        repository
                            .updateOptionType(optionType)
                            .map(count ->
                                new OptionTypeBuilder()
                                    .id(optionType.getId())
                                    .data(optionType.getData())
                                    .version(optionType.getVersion() + 1)
                                    .build())),
                OptionType.class)
            .onErrorMap(e -> new ServerException("OptionType update failed", e));

  }

}

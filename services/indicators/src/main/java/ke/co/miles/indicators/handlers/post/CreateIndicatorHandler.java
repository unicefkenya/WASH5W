/*
 * Copyright (C) 2021 Second Mile
 *
 * This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0.
 * If a copy of the MPL was not distributed with this file,
 * You can obtain one at http://mozilla.org/MPL/2.0/.
 */
package ke.co.miles.indicators.handlers.post;

import ke.co.miles.indicators.exceptions.ServerException;
import ke.co.miles.indicators.models.Indicator;
import ke.co.miles.indicators.repository.IndicatorsRepository;
import ke.co.miles.indicators.util.builders.IndicatorBuilder;
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
public class CreateIndicatorHandler {

  @Autowired
  IndicatorsRepository repository;

  /**
   * Creates a indicator record
   *
   * @param request the request containing the details of the indicator record to be created and the
   *                database within which it should be created
   * @return the response containing the details of the newly created indicator record
   */
  public Mono<ServerResponse> createIndicator(ServerRequest request) {

    log.trace("Entering createIndicator()");

    return
        ServerResponse
            .status(HttpStatus.CREATED)
            .contentType(MediaType.APPLICATION_JSON)
            .body(
                request
                    .bodyToMono(Indicator.class)
                    .flatMap(indicator ->
                        repository
                            .insertIndicator(indicator)
                            .map(id ->
                                new IndicatorBuilder()
                                    .id(id)
                                    .data(indicator.getData())
                                    .version(1)
                                    .build())),
                Indicator.class)
            .onErrorMap(e -> new ServerException("Indicator creation failed", e));
  }


}

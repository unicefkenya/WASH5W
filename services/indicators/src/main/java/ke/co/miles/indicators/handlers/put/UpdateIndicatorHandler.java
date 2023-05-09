/*
 * Copyright (C) 2021 Second Mile
 *
 * This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0.
 * If a copy of the MPL was not distributed with this file,
 * You can obtain one at http://mozilla.org/MPL/2.0/.
 */
package ke.co.miles.indicators.handlers.put;

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
public class UpdateIndicatorHandler {

  @Autowired
  IndicatorsRepository repository;

  /**
   * Updates a indicator record
   *
   * @param request the request containing the details of the indicator record to be updated
   * @return the response containing the details of the newly updated indicator record
   */
  public Mono<ServerResponse> updateIndicator(ServerRequest request) {

    log.trace("Entering updateIndicator()");

    return
        ServerResponse
            .status(HttpStatus.OK)
            .contentType(MediaType.APPLICATION_JSON)
            .body(
                request
                    .bodyToMono(Indicator.class)
                    .flatMap(indicator ->
                        repository
                            .updateIndicator(indicator)
                            .map(count ->
                                new IndicatorBuilder()
                                    .id(indicator.getId())
                                    .data(indicator.getData())
                                    .version(indicator.getVersion() + 1)
                                    .build())),
                Indicator.class)
            .onErrorMap(e -> new ServerException("Indicator update failed", e));

  }

}

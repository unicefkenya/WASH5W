/*
 * Copyright (C) 2021 Second Mile
 *
 * This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0.
 * If a copy of the MPL was not distributed with this file,
 * You can obtain one at http://mozilla.org/MPL/2.0/.
 */
package ke.co.miles.operators.handlers.put;

import ke.co.miles.operators.exceptions.ServerException;
import ke.co.miles.operators.models.Operator;
import ke.co.miles.operators.repository.OperatorsRepository;
import ke.co.miles.operators.util.builders.OperatorBuilder;
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
public class UpdateOperatorHandler {

  @Autowired
  OperatorsRepository repository;

  /**
   * Updates a operator record
   *
   * @param request the request containing the details of the operator record to be updated
   * @return the response containing the details of the newly updated operator record
   */
  public Mono<ServerResponse> updateOperator(ServerRequest request) {

    log.trace("Entering updateOperator()");

    return
        ServerResponse
            .status(HttpStatus.OK)
            .contentType(MediaType.APPLICATION_JSON)
            .body(
                request
                    .bodyToMono(Operator.class)
                    .flatMap(operator ->
                        repository
                            .updateOperator(operator)
                            .map(count ->
                                new OperatorBuilder()
                                    .id(operator.getId())
                                    .data(operator.getData())
                                    .version(operator.getVersion() + 1)
                                    .build())),
                Operator.class)
            .onErrorMap(e -> new ServerException("Operator update failed", e));

  }

}

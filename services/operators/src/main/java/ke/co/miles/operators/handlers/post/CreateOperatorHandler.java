/*
 * Copyright (C) 2021 Second Mile
 *
 * This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0.
 * If a copy of the MPL was not distributed with this file,
 * You can obtain one at http://mozilla.org/MPL/2.0/.
 */
package ke.co.miles.operators.handlers.post;

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
public class CreateOperatorHandler {

  @Autowired
  OperatorsRepository repository;

  /**
   * Creates a operator record
   *
   * @param request the request containing the details of the operator record to be created and the
   *                database within which it should be created
   * @return the response containing the details of the newly created operator record
   */
  public Mono<ServerResponse> createOperator(ServerRequest request) {

    log.trace("Entering createOperator()");

    return
        ServerResponse
            .status(HttpStatus.CREATED)
            .contentType(MediaType.APPLICATION_JSON)
            .body(
                request
                    .bodyToMono(Operator.class)
                    .flatMap(operator ->
                        repository
                            .insertOperator(operator)
                            .map(id ->
                                new OperatorBuilder()
                                    .id(id)
                                    .data(operator.getData())
                                    .version(1)
                                    .build())),
                Operator.class)
            .onErrorMap(e -> new ServerException("Operator creation failed", e));
  }


}

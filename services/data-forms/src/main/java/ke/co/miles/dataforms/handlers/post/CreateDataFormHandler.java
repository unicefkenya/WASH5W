/*
 * Copyright (C) 2021 Second Mile
 *
 * This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0.
 * If a copy of the MPL was not distributed with this file,
 * You can obtain one at http://mozilla.org/MPL/2.0/.
 */
package ke.co.miles.dataforms.handlers.post;

import ke.co.miles.dataforms.exceptions.ServerException;
import ke.co.miles.dataforms.models.DataForm;
import ke.co.miles.dataforms.repository.DataFormsRepository;
import ke.co.miles.dataforms.util.builders.DataFormBuilder;
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
public class CreateDataFormHandler {

  @Autowired
  DataFormsRepository repository;

  /**
   * Creates a dataForm record
   *
   * @param request the request containing the details of the dataForm record to be created and the
   *                database within which it should be created
   * @return the response containing the details of the newly created dataForm record
   */
  public Mono<ServerResponse> createDataForm(ServerRequest request) {

    log.trace("Entering createDataForm()");

    return
        ServerResponse
            .status(HttpStatus.CREATED)
            .contentType(MediaType.APPLICATION_JSON)
            .body(
                request
                    .bodyToMono(DataForm.class)
                    .flatMap(dataForm ->
                        repository
                            .insertDataForm(dataForm)
                            .map(id ->
                                new DataFormBuilder()
                                    .id(id)
                                    .data(dataForm.getData())
                                    .version(1)
                                    .build())),
                DataForm.class)
            .onErrorMap(e -> new ServerException("DataForm creation failed", e));
  }


}

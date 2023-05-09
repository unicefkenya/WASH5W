/*
 * Copyright (C) 2021 Second Mile
 *
 * This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0.
 * If a copy of the MPL was not distributed with this file,
 * You can obtain one at http://mozilla.org/MPL/2.0/.
 */
package ke.co.miles.dataforms.handlers.put;

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
public class UpdateDataFormHandler {

  @Autowired
  DataFormsRepository repository;

  /**
   * Updates a dataForm record
   *
   * @param request the request containing the details of the dataForm record to be updated
   * @return the response containing the details of the newly updated dataForm record
   */
  public Mono<ServerResponse> updateDataForm(ServerRequest request) {

    log.trace("Entering updateDataForm()");

    return
        ServerResponse
            .status(HttpStatus.OK)
            .contentType(MediaType.APPLICATION_JSON)
            .body(
                request
                    .bodyToMono(DataForm.class)
                    .flatMap(dataForm ->
                        repository
                            .updateDataForm(dataForm)
                            .map(count ->
                                new DataFormBuilder()
                                    .id(dataForm.getId())
                                    .data(dataForm.getData())
                                    .version(dataForm.getVersion() + 1)
                                    .build())),
                DataForm.class)
            .onErrorMap(e -> new ServerException("DataForm update failed", e));

  }

}

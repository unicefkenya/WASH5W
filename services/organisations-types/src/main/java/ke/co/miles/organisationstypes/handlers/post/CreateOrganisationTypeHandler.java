/*
 * Copyright (C) 2021 Second Mile
 *
 * This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0.
 * If a copy of the MPL was not distributed with this file,
 * You can obtain one at http://mozilla.org/MPL/2.0/.
 */
package ke.co.miles.organisationstypes.handlers.post;

import ke.co.miles.organisationstypes.exceptions.ServerException;
import ke.co.miles.organisationstypes.models.OrganisationType;
import ke.co.miles.organisationstypes.repository.OrganisationsTypesRepository;
import ke.co.miles.organisationstypes.util.builders.OrganisationTypeBuilder;
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
public class CreateOrganisationTypeHandler {

  @Autowired
  OrganisationsTypesRepository repository;

  /**
   * Creates a organisationType record
   *
   * @param request the request containing the details of the organisationType record to be created and the
   *                database within which it should be created
   * @return the response containing the details of the newly created organisationType record
   */
  public Mono<ServerResponse> createOrganisationType(ServerRequest request) {

    log.trace("Entering createOrganisationType()");

    return
        ServerResponse
            .status(HttpStatus.CREATED)
            .contentType(MediaType.APPLICATION_JSON)
            .body(
                request
                    .bodyToMono(OrganisationType.class)
                    .flatMap(organisationType ->
                        repository
                            .insertOrganisationType(organisationType)
                            .map(id ->
                                new OrganisationTypeBuilder()
                                    .id(id)
                                    .data(organisationType.getData())
                                    .version(1)
                                    .build())),
                OrganisationType.class)
            .onErrorMap(e -> new ServerException("OrganisationType creation failed", e));
  }


}

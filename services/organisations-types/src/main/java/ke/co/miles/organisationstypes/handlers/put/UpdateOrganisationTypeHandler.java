/*
 * Copyright (C) 2021 Second Mile
 *
 * This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0.
 * If a copy of the MPL was not distributed with this file,
 * You can obtain one at http://mozilla.org/MPL/2.0/.
 */
package ke.co.miles.organisationstypes.handlers.put;

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
public class UpdateOrganisationTypeHandler {

  @Autowired
  OrganisationsTypesRepository repository;

  /**
   * Updates a organisationType record
   *
   * @param request the request containing the details of the organisationType record to be updated
   * @return the response containing the details of the newly updated organisationType record
   */
  public Mono<ServerResponse> updateOrganisationType(ServerRequest request) {

    log.trace("Entering updateOrganisationType()");

    return
        ServerResponse
            .status(HttpStatus.OK)
            .contentType(MediaType.APPLICATION_JSON)
            .body(
                request
                    .bodyToMono(OrganisationType.class)
                    .flatMap(organisationType ->
                        repository
                            .updateOrganisationType(organisationType)
                            .map(count ->
                                new OrganisationTypeBuilder()
                                    .id(organisationType.getId())
                                    .data(organisationType.getData())
                                    .version(organisationType.getVersion() + 1)
                                    .build())),
                OrganisationType.class)
            .onErrorMap(e -> new ServerException("OrganisationType update failed", e));

  }

}

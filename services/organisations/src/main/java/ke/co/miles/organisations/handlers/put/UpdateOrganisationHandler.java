/*
 * Copyright (C) 2021 Second Mile
 *
 * This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0.
 * If a copy of the MPL was not distributed with this file,
 * You can obtain one at http://mozilla.org/MPL/2.0/.
 */
package ke.co.miles.organisations.handlers.put;

import ke.co.miles.organisations.exceptions.ServerException;
import ke.co.miles.organisations.models.Organisation;
import ke.co.miles.organisations.repository.OrganisationsRepository;
import ke.co.miles.organisations.util.builders.OrganisationBuilder;
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
public class UpdateOrganisationHandler {

  @Autowired
  OrganisationsRepository repository;

  /**
   * Updates a organisation record
   *
   * @param request the request containing the details of the organisation record to be updated
   * @return the response containing the details of the newly updated organisation record
   */
  public Mono<ServerResponse> updateOrganisation(ServerRequest request) {

    log.trace("Entering updateOrganisation()");

    return
        ServerResponse
            .status(HttpStatus.OK)
            .contentType(MediaType.APPLICATION_JSON)
            .body(
                request
                    .bodyToMono(Organisation.class)
                    .flatMap(organisation ->
                        repository
                            .updateOrganisation(organisation)
                            .map(count ->
                                new OrganisationBuilder()
                                    .id(organisation.getId())
                                    .data(organisation.getData())
                                    .version(organisation.getVersion() + 1)
                                    .build())),
                Organisation.class)
            .onErrorMap(e -> new ServerException("Organisation update failed", e));

  }

}

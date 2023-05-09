/*
 * Copyright (C) 2021 Second Mile
 *
 * This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0.
 * If a copy of the MPL was not distributed with this file,
 * You can obtain one at http://mozilla.org/MPL/2.0/.
 */
package ke.co.miles.accountabilitieshierarchies.handlers.post;

import ke.co.miles.accountabilitieshierarchies.exceptions.ServerException;
import ke.co.miles.accountabilitieshierarchies.models.AccountabilityHierarchy;
import ke.co.miles.accountabilitieshierarchies.repository.AccountabilitiesHierarchiesRepository;
import ke.co.miles.accountabilitieshierarchies.util.builders.AccountabilityHierarchyBuilder;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.reactive.function.server.ServerRequest;
import org.springframework.web.reactive.function.server.ServerResponse;
import reactor.core.publisher.Mono;

/**
 * @since 1.0
 * @author Kwaje Anthony <tony@miles.co.ke>
 * @version 1.0
 */
@Component
@Slf4j
public class CreateAccountabilitiesHierarchiesHandler {

	@Autowired
    AccountabilitiesHierarchiesRepository repository;
	

	/**
	 * Recursively creates accountabilities hierarchies records
	 *
	 * @param request the request containing the details of the accountabilities hierarchies records to be created
	 * @return the stream of responses containing the details of the newly created accountabilities hierarchies records
	 */
	public Mono<ServerResponse> createAccountabilitiesHierarchies(ServerRequest request) {

		log.trace("Entering createAccountabilitiesHierarchies()");

		return
				ServerResponse
						.status(HttpStatus.CREATED)
						.contentType(MediaType.APPLICATION_JSON)
						.body(
								request
										.bodyToFlux(AccountabilityHierarchy.class)
										.flatMap(accountabilityHierarchy ->
												repository
														.insertAccountabilityHierarchy(
																request.pathVariable("database"),
																accountabilityHierarchy)
														.map(id ->
																new AccountabilityHierarchyBuilder()
																		.id(id)
																		.data(accountabilityHierarchy.getData())
																		.version(1)
																		.build())
										),
								AccountabilityHierarchy.class)
						.onErrorMap(e -> new ServerException("Accountability Hierarchy creation failed", e));
	}



}

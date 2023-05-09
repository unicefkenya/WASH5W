/*
 * Copyright (C) 2021 Second Mile
 *
 * This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0.
 * If a copy of the MPL was not distributed with this file,
 * You can obtain one at http://mozilla.org/MPL/2.0/.
 */
package ke.co.miles.statuses.handlers.post;

import ke.co.miles.statuses.exceptions.ServerException;
import ke.co.miles.statuses.models.Status;
import ke.co.miles.statuses.repository.StatusesRepository;
import ke.co.miles.statuses.util.builders.StatusBuilder;
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
public class CreateStatusesHandler {

	@Autowired
    StatusesRepository repository;
	

	/**
	 * Recursively creates statuses records
	 *
	 * @param request the request containing the details of the statuses records to be created
	 * @return the stream of responses containing the details of the newly created statuses records
	 */
	public Mono<ServerResponse> createStatuses(ServerRequest request) {

		log.trace("Entering createStatuses()");

		return
				ServerResponse
						.status(HttpStatus.CREATED)
						.contentType(MediaType.APPLICATION_JSON)
						.body(
								request
										.bodyToFlux(Status.class)
										.flatMap(status ->
												repository
														.insertStatus(
																request.pathVariable("database"),
																status)
														.map(id ->
																new StatusBuilder()
																		.id(id)
																		.data(status.getData())
																		.version(1)
																		.build())
										),
								Status.class)
						.onErrorMap(e -> new ServerException("Status creation failed", e));
	}



}

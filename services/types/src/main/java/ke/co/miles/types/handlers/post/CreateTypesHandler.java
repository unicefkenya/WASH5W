/*
 * Copyright (C) 2021 Second Mile
 *
 * This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0.
 * If a copy of the MPL was not distributed with this file,
 * You can obtain one at http://mozilla.org/MPL/2.0/.
 */
package ke.co.miles.types.handlers.post;

import ke.co.miles.types.exceptions.ServerException;
import ke.co.miles.types.models.Type;
import ke.co.miles.types.repository.TypesRepository;
import ke.co.miles.types.util.builders.TypeBuilder;
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
public class CreateTypesHandler {

	@Autowired
    TypesRepository repository;
	

	/**
	 * Recursively creates types records
	 *
	 * @param request the request containing the details of the types records to be created
	 * @return the stream of responses containing the details of the newly created types records
	 */
	public Mono<ServerResponse> createTypes(ServerRequest request) {

		log.trace("Entering createTypes()");

		return
				ServerResponse
						.status(HttpStatus.CREATED)
						.contentType(MediaType.APPLICATION_JSON)
						.body(
								request
										.bodyToFlux(Type.class)
										.flatMap(type ->
												repository
														.insertType(
																request.pathVariable("database"),
																type)
														.map(id ->
																new TypeBuilder()
																		.id(id)
																		.data(type.getData())
																		.version(1)
																		.build())
										),
								Type.class)
						.onErrorMap(e -> new ServerException("Type creation failed", e));
	}



}

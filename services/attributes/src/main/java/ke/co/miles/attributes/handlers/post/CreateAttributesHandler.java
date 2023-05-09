/*
 * Copyright (C) 2021 Second Mile
 *
 * This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0.
 * If a copy of the MPL was not distributed with this file,
 * You can obtain one at http://mozilla.org/MPL/2.0/.
 */
package ke.co.miles.attributes.handlers.post;

import ke.co.miles.attributes.exceptions.ServerException;
import ke.co.miles.attributes.models.Attribute;
import ke.co.miles.attributes.repository.AttributesRepository;
import ke.co.miles.attributes.util.builders.AttributeBuilder;
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
public class CreateAttributesHandler {

	@Autowired
    AttributesRepository repository;
	

	/**
	 * Recursively creates attributes records
	 *
	 * @param request the request containing the details of the attributes records to be created
	 * @return the stream of responses containing the details of the newly created attributes records
	 */
	public Mono<ServerResponse> createAttributes(ServerRequest request) {

		log.trace("Entering createAttributes()");

		return
				ServerResponse
						.status(HttpStatus.CREATED)
						.contentType(MediaType.APPLICATION_JSON)
						.body(
								request
										.bodyToFlux(Attribute.class)
										.flatMap(attribute ->
												repository
														.insertAttribute(
																request.pathVariable("database"),
																attribute)
														.map(id ->
																new AttributeBuilder()
																		.id(id)
																		.data(attribute.getData())
																		.version(1)
																		.build())
										),
								Attribute.class)
						.onErrorMap(e -> new ServerException("Attribute creation failed", e));
	}



}

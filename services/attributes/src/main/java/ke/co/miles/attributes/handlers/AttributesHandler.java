/*
 * Copyright (C) 2021 Second Mile
 *
 * This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0.
 * If a copy of the MPL was not distributed with this file,
 * You can obtain one at http://mozilla.org/MPL/2.0/.
 */
package ke.co.miles.attributes.handlers;

import ke.co.miles.attributes.handlers.delete.DeleteAttributeHandler;
import ke.co.miles.attributes.handlers.delete.DeleteAttributesHandler;
import ke.co.miles.attributes.handlers.get.RetrieveAttributesHandler;
import ke.co.miles.attributes.handlers.get.RetrieveTotalAttributesHandler;
import ke.co.miles.attributes.handlers.put.UpdateAttributeHandler;
import ke.co.miles.attributes.handlers.put.UpdateAttributesHandler;
import ke.co.miles.attributes.handlers.post.CreateAttributesHandler;
import ke.co.miles.attributes.handlers.get.RetrieveAttributeHandler;
import ke.co.miles.attributes.handlers.post.CreateAttributeHandler;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
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
public class AttributesHandler {

	// POST HANDLERS
	@Autowired
	CreateAttributeHandler createAttributeHandler;

	@Autowired
	CreateAttributesHandler createAttributesHandler;

	
	// GET HANDLERS
	@Autowired
	RetrieveAttributeHandler retrieveAttributeByIdHandler;
	
	@Autowired
	RetrieveAttributesHandler retrieveAttributesHandler;

	@Autowired
	RetrieveTotalAttributesHandler retrieveTotalAttributesHandler;

	
	// PUT HANDLERS
	@Autowired
	UpdateAttributeHandler updateAttributeHandler;
	
	@Autowired
	UpdateAttributesHandler updateAttributesHandler;

	
	// DELETE HANDLERS
	@Autowired
	DeleteAttributeHandler deleteAttributeByIdHandler;
	
	@Autowired
	DeleteAttributesHandler deleteAttributesHandler;

	
	// <editor-fold desc="POST">
	public Mono<ServerResponse> createAttribute(ServerRequest request) {
		return this.createAttributeHandler.createAttribute(request);
	}
	
	public Mono<ServerResponse> createAttributes(ServerRequest request) {
		return createAttributesHandler.createAttributes(request);
	}

	// </editor-fold>

	// <editor-fold desc="GET">

	public Mono<ServerResponse> retrieveAttribute(ServerRequest request) {
		return this.retrieveAttributeByIdHandler.retrieveAttribute(request);
	}
	
	public Mono<ServerResponse> retrieveAttributes(ServerRequest request) {
		return this.retrieveAttributesHandler.retrieveAttributes(request);
	}

	public Mono<ServerResponse> retrieveTotalAttributes(ServerRequest request) {
		return this.retrieveTotalAttributesHandler.retrieveTotalAttributes(request);
	}
	

	// </editor-fold>	

	// <editor-fold desc="PUT">
	public Mono<ServerResponse> updateAttribute(ServerRequest request) {
		return this.updateAttributeHandler.updateAttribute(request);
	}
	
	public Mono<ServerResponse> updateAttributes(ServerRequest request) {
		return this.updateAttributesHandler.updateAttributes(request);
	}	

	// </editor-fold>	
	
	// <editor-fold desc="DELETE">
	public Mono<ServerResponse> deleteAttribute(ServerRequest request) {
		return this.deleteAttributeByIdHandler.deleteAttribute(request);
	}
	
	public Mono<ServerResponse> deleteAttributes(ServerRequest request) {
		return this.deleteAttributesHandler.deleteAttributes(request);
	}	

	// </editor-fold>	

}

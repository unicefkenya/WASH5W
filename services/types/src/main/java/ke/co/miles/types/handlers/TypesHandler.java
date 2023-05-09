/*
 * Copyright (C) 2021 Second Mile
 *
 * This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0.
 * If a copy of the MPL was not distributed with this file,
 * You can obtain one at http://mozilla.org/MPL/2.0/.
 */
package ke.co.miles.types.handlers;

import ke.co.miles.types.handlers.delete.DeleteTypeHandler;
import ke.co.miles.types.handlers.delete.DeleteTypesHandler;
import ke.co.miles.types.handlers.get.RetrieveTypesHandler;
import ke.co.miles.types.handlers.get.RetrieveTotalTypesHandler;
import ke.co.miles.types.handlers.put.UpdateTypeHandler;
import ke.co.miles.types.handlers.put.UpdateTypesHandler;
import ke.co.miles.types.handlers.post.CreateTypesHandler;
import ke.co.miles.types.handlers.get.RetrieveTypeHandler;
import ke.co.miles.types.handlers.post.CreateTypeHandler;
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
public class TypesHandler {

	// POST HANDLERS
	@Autowired
	CreateTypeHandler createTypeHandler;

	@Autowired
	CreateTypesHandler createTypesHandler;

	
	// GET HANDLERS
	@Autowired
	RetrieveTypeHandler retrieveTypeByIdHandler;
	
	@Autowired
	RetrieveTypesHandler retrieveTypesHandler;

	@Autowired
	RetrieveTotalTypesHandler retrieveTotalTypesHandler;

	
	// PUT HANDLERS
	@Autowired
	UpdateTypeHandler updateTypeHandler;
	
	@Autowired
	UpdateTypesHandler updateTypesHandler;

	
	// DELETE HANDLERS
	@Autowired
	DeleteTypeHandler deleteTypeByIdHandler;
	
	@Autowired
	DeleteTypesHandler deleteTypesHandler;

	
	// <editor-fold desc="POST">
	public Mono<ServerResponse> createType(ServerRequest request) {
		return this.createTypeHandler.createType(request);
	}
	
	public Mono<ServerResponse> createTypes(ServerRequest request) {
		return createTypesHandler.createTypes(request);
	}

	// </editor-fold>

	// <editor-fold desc="GET">

	public Mono<ServerResponse> retrieveType(ServerRequest request) {
		return this.retrieveTypeByIdHandler.retrieveType(request);
	}
	
	public Mono<ServerResponse> retrieveTypes(ServerRequest request) {
		return this.retrieveTypesHandler.retrieveTypes(request);
	}

	public Mono<ServerResponse> retrieveTotalTypes(ServerRequest request) {
		return this.retrieveTotalTypesHandler.retrieveTotalTypes(request);
	}
	

	// </editor-fold>	

	// <editor-fold desc="PUT">
	public Mono<ServerResponse> updateType(ServerRequest request) {
		return this.updateTypeHandler.updateType(request);
	}
	
	public Mono<ServerResponse> updateTypes(ServerRequest request) {
		return this.updateTypesHandler.updateTypes(request);
	}	

	// </editor-fold>	
	
	// <editor-fold desc="DELETE">
	public Mono<ServerResponse> deleteType(ServerRequest request) {
		return this.deleteTypeByIdHandler.deleteType(request);
	}
	
	public Mono<ServerResponse> deleteTypes(ServerRequest request) {
		return this.deleteTypesHandler.deleteTypes(request);
	}	

	// </editor-fold>	

}

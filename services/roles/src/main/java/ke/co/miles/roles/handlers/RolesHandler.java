/*
 * Copyright (C) 2021 Second Mile
 *
 * This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0.
 * If a copy of the MPL was not distributed with this file,
 * You can obtain one at http://mozilla.org/MPL/2.0/.
 */
package ke.co.miles.roles.handlers;

import ke.co.miles.roles.handlers.delete.DeleteRoleHandler;
import ke.co.miles.roles.handlers.delete.DeleteRolesHandler;
import ke.co.miles.roles.handlers.get.RetrieveRoleHandler;
import ke.co.miles.roles.handlers.get.RetrieveRolesHandler;
import ke.co.miles.roles.handlers.get.RetrieveTotalRolesHandler;
import ke.co.miles.roles.handlers.post.CreateRoleHandler;
import ke.co.miles.roles.handlers.post.CreateRolesHandler;
import ke.co.miles.roles.handlers.put.UpdateRoleHandler;
import ke.co.miles.roles.handlers.put.UpdateRolesHandler;
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
public class RolesHandler {

	// POST HANDLERS
	@Autowired
	CreateRoleHandler createRoleHandler;

	@Autowired
	CreateRolesHandler createRolesHandler;

	
	// GET HANDLERS
	@Autowired
	RetrieveRoleHandler retrieveRoleByIdHandler;
	
	@Autowired
	RetrieveRolesHandler retrieveRolesHandler;

	@Autowired
	RetrieveTotalRolesHandler retrieveTotalRolesHandler;

	
	// PUT HANDLERS
	@Autowired
	UpdateRoleHandler updateRoleHandler;
	
	@Autowired
	UpdateRolesHandler updateRolesHandler;

	
	// DELETE HANDLERS
	@Autowired
	DeleteRoleHandler deleteRoleByIdHandler;
	
	@Autowired
	DeleteRolesHandler deleteRolesHandler;

	
	// <editor-fold desc="POST">
	public Mono<ServerResponse> createRole(ServerRequest request) {
		return this.createRoleHandler.createRole(request);
	}
	
	public Mono<ServerResponse> createRoles(ServerRequest request) {
		return createRolesHandler.createRoles(request);
	}

	// </editor-fold>

	// <editor-fold desc="GET">

	public Mono<ServerResponse> retrieveRole(ServerRequest request) {
		return this.retrieveRoleByIdHandler.retrieveRole(request);
	}
	
	public Mono<ServerResponse> retrieveRoles(ServerRequest request) {
		return this.retrieveRolesHandler.retrieveRoles(request);
	}

	public Mono<ServerResponse> retrieveTotalRoles(ServerRequest request) {
		return this.retrieveTotalRolesHandler.retrieveTotalRoles(request);
	}
	

	// </editor-fold>	

	// <editor-fold desc="PUT">
	public Mono<ServerResponse> updateRole(ServerRequest request) {
		return this.updateRoleHandler.updateRole(request);
	}
	
	public Mono<ServerResponse> updateRoles(ServerRequest request) {
		return this.updateRolesHandler.updateRoles(request);
	}	

	// </editor-fold>	
	
	// <editor-fold desc="DELETE">
	public Mono<ServerResponse> deleteRole(ServerRequest request) {
		return this.deleteRoleByIdHandler.deleteRole(request);
	}
	
	public Mono<ServerResponse> deleteRoles(ServerRequest request) {
		return this.deleteRolesHandler.deleteRoles(request);
	}	

	// </editor-fold>	

}

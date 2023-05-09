/*
 * Copyright (C) 2021 Second Mile
 *
 * This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0.
 * If a copy of the MPL was not distributed with this file,
 * You can obtain one at http://mozilla.org/MPL/2.0/.
 */
package ke.co.miles.groups.handlers;

import ke.co.miles.groups.handlers.delete.DeleteGroupHandler;
import ke.co.miles.groups.handlers.delete.DeleteGroupsHandler;
import ke.co.miles.groups.handlers.get.RetrieveGroupsHandler;
import ke.co.miles.groups.handlers.get.RetrieveTotalGroupsHandler;
import ke.co.miles.groups.handlers.put.UpdateGroupHandler;
import ke.co.miles.groups.handlers.put.UpdateGroupsHandler;
import ke.co.miles.groups.handlers.post.CreateGroupsHandler;
import ke.co.miles.groups.handlers.get.RetrieveGroupHandler;
import ke.co.miles.groups.handlers.post.CreateGroupHandler;
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
public class GroupsHandler {

	// POST HANDLERS
	@Autowired
	CreateGroupHandler createGroupHandler;

	@Autowired
	CreateGroupsHandler createGroupsHandler;

	
	// GET HANDLERS
	@Autowired
	RetrieveGroupHandler retrieveGroupByIdHandler;
	
	@Autowired
	RetrieveGroupsHandler retrieveGroupsHandler;

	@Autowired
	RetrieveTotalGroupsHandler retrieveTotalGroupsHandler;

	
	// PUT HANDLERS
	@Autowired
	UpdateGroupHandler updateGroupHandler;
	
	@Autowired
	UpdateGroupsHandler updateGroupsHandler;

	
	// DELETE HANDLERS
	@Autowired
	DeleteGroupHandler deleteGroupByIdHandler;
	
	@Autowired
	DeleteGroupsHandler deleteGroupsHandler;

	
	// <editor-fold desc="POST">
	public Mono<ServerResponse> createGroup(ServerRequest request) {
		return this.createGroupHandler.createGroup(request);
	}
	
	public Mono<ServerResponse> createGroups(ServerRequest request) {
		return createGroupsHandler.createGroups(request);
	}

	// </editor-fold>

	// <editor-fold desc="GET">

	public Mono<ServerResponse> retrieveGroup(ServerRequest request) {
		return this.retrieveGroupByIdHandler.retrieveGroup(request);
	}
	
	public Mono<ServerResponse> retrieveGroups(ServerRequest request) {
		return this.retrieveGroupsHandler.retrieveGroups(request);
	}

	public Mono<ServerResponse> retrieveTotalGroups(ServerRequest request) {
		return this.retrieveTotalGroupsHandler.retrieveTotalGroups(request);
	}
	

	// </editor-fold>	

	// <editor-fold desc="PUT">
	public Mono<ServerResponse> updateGroup(ServerRequest request) {
		return this.updateGroupHandler.updateGroup(request);
	}
	
	public Mono<ServerResponse> updateGroups(ServerRequest request) {
		return this.updateGroupsHandler.updateGroups(request);
	}	

	// </editor-fold>	
	
	// <editor-fold desc="DELETE">
	public Mono<ServerResponse> deleteGroup(ServerRequest request) {
		return this.deleteGroupByIdHandler.deleteGroup(request);
	}
	
	public Mono<ServerResponse> deleteGroups(ServerRequest request) {
		return this.deleteGroupsHandler.deleteGroups(request);
	}	

	// </editor-fold>	

}

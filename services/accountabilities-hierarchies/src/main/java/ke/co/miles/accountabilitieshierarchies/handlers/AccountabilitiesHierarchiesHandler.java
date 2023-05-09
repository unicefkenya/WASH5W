/*
 * Copyright (C) 2021 Second Mile
 *
 * This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0.
 * If a copy of the MPL was not distributed with this file,
 * You can obtain one at http://mozilla.org/MPL/2.0/.
 */
package ke.co.miles.accountabilitieshierarchies.handlers;

import ke.co.miles.accountabilitieshierarchies.handlers.delete.DeleteAccountabilityHierarchyHandler;
import ke.co.miles.accountabilitieshierarchies.handlers.delete.DeleteAccountabilitiesHierarchiesHandler;
import ke.co.miles.accountabilitieshierarchies.handlers.get.RetrieveAccountabilityHierarchyHandler;
import ke.co.miles.accountabilitieshierarchies.handlers.get.RetrieveAccountabilitiesHierarchiesHandler;
import ke.co.miles.accountabilitieshierarchies.handlers.get.RetrieveTotalAccountabilitiesHierarchiesHandler;
import ke.co.miles.accountabilitieshierarchies.handlers.post.CreateAccountabilityHierarchyHandler;
import ke.co.miles.accountabilitieshierarchies.handlers.post.CreateAccountabilitiesHierarchiesHandler;
import ke.co.miles.accountabilitieshierarchies.handlers.put.UpdateAccountabilityHierarchyHandler;
import ke.co.miles.accountabilitieshierarchies.handlers.put.UpdateAccountabilitiesHierarchiesHandler;
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
public class AccountabilitiesHierarchiesHandler {

	// POST HANDLERS
	@Autowired
	CreateAccountabilityHierarchyHandler createAccountabilityHierarchyHandler;

	@Autowired
	CreateAccountabilitiesHierarchiesHandler createAccountabilitiesHierarchiesHandler;

	
	// GET HANDLERS
	@Autowired
	RetrieveAccountabilityHierarchyHandler retrieveAccountabilityHierarchyByIdHandler;
	
	@Autowired
	RetrieveAccountabilitiesHierarchiesHandler retrieveAccountabilitiesHierarchiesHandler;

	@Autowired
	RetrieveTotalAccountabilitiesHierarchiesHandler retrieveTotalAccountabilitiesHierarchiesHandler;

	
	// PUT HANDLERS
	@Autowired
	UpdateAccountabilityHierarchyHandler updateAccountabilityHierarchyHandler;
	
	@Autowired
	UpdateAccountabilitiesHierarchiesHandler updateAccountabilitiesHierarchiesHandler;

	
	// DELETE HANDLERS
	@Autowired
	DeleteAccountabilityHierarchyHandler deleteAccountabilityHierarchyByIdHandler;
	
	@Autowired
	DeleteAccountabilitiesHierarchiesHandler deleteAccountabilitiesHierarchiesHandler;

	
	// <editor-fold desc="POST">
	public Mono<ServerResponse> createAccountabilityHierarchy(ServerRequest request) {
		return this.createAccountabilityHierarchyHandler.createAccountabilityHierarchy(request);
	}
	
	public Mono<ServerResponse> createAccountabilitiesHierarchies(ServerRequest request) {
		return createAccountabilitiesHierarchiesHandler.createAccountabilitiesHierarchies(request);
	}

	// </editor-fold>

	// <editor-fold desc="GET">

	public Mono<ServerResponse> retrieveAccountabilityHierarchy(ServerRequest request) {
		return this.retrieveAccountabilityHierarchyByIdHandler.retrieveAccountabilityHierarchy(request);
	}
	
	public Mono<ServerResponse> retrieveAccountabilitiesHierarchies(ServerRequest request) {
		return this.retrieveAccountabilitiesHierarchiesHandler.retrieveAccountabilitiesHierarchies(request);
	}

	public Mono<ServerResponse> retrieveTotalAccountabilitiesHierarchies(ServerRequest request) {
		return this.retrieveTotalAccountabilitiesHierarchiesHandler.retrieveTotalAccountabilitiesHierarchies(request);
	}
	

	// </editor-fold>	

	// <editor-fold desc="PUT">
	public Mono<ServerResponse> updateAccountabilityHierarchy(ServerRequest request) {
		return this.updateAccountabilityHierarchyHandler.updateAccountabilityHierarchy(request);
	}
	
	public Mono<ServerResponse> updateAccountabilitiesHierarchies(ServerRequest request) {
		return this.updateAccountabilitiesHierarchiesHandler.updateAccountabilitiesHierarchies(request);
	}	

	// </editor-fold>	
	
	// <editor-fold desc="DELETE">
	public Mono<ServerResponse> deleteAccountabilityHierarchy(ServerRequest request) {
		return this.deleteAccountabilityHierarchyByIdHandler.deleteAccountabilityHierarchy(request);
	}
	
	public Mono<ServerResponse> deleteAccountabilitiesHierarchies(ServerRequest request) {
		return this.deleteAccountabilitiesHierarchiesHandler.deleteAccountabilitiesHierarchies(request);
	}	

	// </editor-fold>	

}

/*
 * Copyright (C) 2021 Second Mile
 *
 * This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0.
 * If a copy of the MPL was not distributed with this file,
 * You can obtain one at http://mozilla.org/MPL/2.0/.
 */
package ke.co.miles.statuses.handlers;

import ke.co.miles.statuses.handlers.delete.DeleteStatusHandler;
import ke.co.miles.statuses.handlers.delete.DeleteStatusesHandler;
import ke.co.miles.statuses.handlers.get.RetrieveStatusHandler;
import ke.co.miles.statuses.handlers.get.RetrieveStatusesHandler;
import ke.co.miles.statuses.handlers.get.RetrieveTotalStatusesHandler;
import ke.co.miles.statuses.handlers.post.CreateStatusHandler;
import ke.co.miles.statuses.handlers.post.CreateStatusesHandler;
import ke.co.miles.statuses.handlers.put.UpdateStatusHandler;
import ke.co.miles.statuses.handlers.put.UpdateStatusesHandler;
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
public class StatusesHandler {

	// POST HANDLERS
	@Autowired
	CreateStatusHandler createStatusHandler;

	@Autowired
	CreateStatusesHandler createStatusesHandler;

	
	// GET HANDLERS
	@Autowired
	RetrieveStatusHandler retrieveStatusByIdHandler;
	
	@Autowired
	RetrieveStatusesHandler retrieveStatusesHandler;

	@Autowired
	RetrieveTotalStatusesHandler retrieveTotalStatusesHandler;

	
	// PUT HANDLERS
	@Autowired
	UpdateStatusHandler updateStatusHandler;
	
	@Autowired
	UpdateStatusesHandler updateStatusesHandler;

	
	// DELETE HANDLERS
	@Autowired
	DeleteStatusHandler deleteStatusByIdHandler;
	
	@Autowired
	DeleteStatusesHandler deleteStatusesHandler;

	
	// <editor-fold desc="POST">
	public Mono<ServerResponse> createStatus(ServerRequest request) {
		return this.createStatusHandler.createStatus(request);
	}
	
	public Mono<ServerResponse> createStatuses(ServerRequest request) {
		return createStatusesHandler.createStatuses(request);
	}

	// </editor-fold>

	// <editor-fold desc="GET">

	public Mono<ServerResponse> retrieveStatus(ServerRequest request) {
		return this.retrieveStatusByIdHandler.retrieveStatus(request);
	}
	
	public Mono<ServerResponse> retrieveStatuses(ServerRequest request) {
		return this.retrieveStatusesHandler.retrieveStatuses(request);
	}

	public Mono<ServerResponse> retrieveTotalStatuses(ServerRequest request) {
		return this.retrieveTotalStatusesHandler.retrieveTotalStatuses(request);
	}
	

	// </editor-fold>	

	// <editor-fold desc="PUT">
	public Mono<ServerResponse> updateStatus(ServerRequest request) {
		return this.updateStatusHandler.updateStatus(request);
	}
	
	public Mono<ServerResponse> updateStatuses(ServerRequest request) {
		return this.updateStatusesHandler.updateStatuses(request);
	}	

	// </editor-fold>	
	
	// <editor-fold desc="DELETE">
	public Mono<ServerResponse> deleteStatus(ServerRequest request) {
		return this.deleteStatusByIdHandler.deleteStatus(request);
	}
	
	public Mono<ServerResponse> deleteStatuses(ServerRequest request) {
		return this.deleteStatusesHandler.deleteStatuses(request);
	}	

	// </editor-fold>	

}

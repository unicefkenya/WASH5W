/*
 * Copyright (C) 2021 Second Mile
 *
 * This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0.
 * If a copy of the MPL was not distributed with this file,
 * You can obtain one at http://mozilla.org/MPL/2.0/.
 */
package ke.co.miles.levels.handlers;

import ke.co.miles.levels.handlers.delete.DeleteLevelHandler;
import ke.co.miles.levels.handlers.delete.DeleteLevelsHandler;
import ke.co.miles.levels.handlers.get.RetrieveLevelHandler;
import ke.co.miles.levels.handlers.get.RetrieveLevelsHandler;
import ke.co.miles.levels.handlers.get.RetrieveTotalLevelsHandler;
import ke.co.miles.levels.handlers.post.CreateLevelHandler;
import ke.co.miles.levels.handlers.post.CreateLevelsHandler;
import ke.co.miles.levels.handlers.put.UpdateLevelHandler;
import ke.co.miles.levels.handlers.put.UpdateLevelsHandler;
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
public class LevelsHandler {

	// POST HANDLERS
	@Autowired
	CreateLevelHandler createLevelHandler;

	@Autowired
	CreateLevelsHandler createLevelsHandler;

	
	// GET HANDLERS
	@Autowired
	RetrieveLevelHandler retrieveLevelByIdHandler;
	
	@Autowired
	RetrieveLevelsHandler retrieveLevelsHandler;

	@Autowired
	RetrieveTotalLevelsHandler retrieveTotalLevelsHandler;

	
	// PUT HANDLERS
	@Autowired
	UpdateLevelHandler updateLevelHandler;
	
	@Autowired
	UpdateLevelsHandler updateLevelsHandler;

	
	// DELETE HANDLERS
	@Autowired
	DeleteLevelHandler deleteLevelByIdHandler;
	
	@Autowired
	DeleteLevelsHandler deleteLevelsHandler;

	
	// <editor-fold desc="POST">
	public Mono<ServerResponse> createLevel(ServerRequest request) {
		return this.createLevelHandler.createLevel(request);
	}
	
	public Mono<ServerResponse> createLevels(ServerRequest request) {
		return createLevelsHandler.createLevels(request);
	}

	// </editor-fold>

	// <editor-fold desc="GET">

	public Mono<ServerResponse> retrieveLevel(ServerRequest request) {
		return this.retrieveLevelByIdHandler.retrieveLevel(request);
	}
	
	public Mono<ServerResponse> retrieveLevels(ServerRequest request) {
		return this.retrieveLevelsHandler.retrieveLevels(request);
	}

	public Mono<ServerResponse> retrieveTotalLevels(ServerRequest request) {
		return this.retrieveTotalLevelsHandler.retrieveTotalLevels(request);
	}
	

	// </editor-fold>	

	// <editor-fold desc="PUT">
	public Mono<ServerResponse> updateLevel(ServerRequest request) {
		return this.updateLevelHandler.updateLevel(request);
	}
	
	public Mono<ServerResponse> updateLevels(ServerRequest request) {
		return this.updateLevelsHandler.updateLevels(request);
	}	

	// </editor-fold>	
	
	// <editor-fold desc="DELETE">
	public Mono<ServerResponse> deleteLevel(ServerRequest request) {
		return this.deleteLevelByIdHandler.deleteLevel(request);
	}
	
	public Mono<ServerResponse> deleteLevels(ServerRequest request) {
		return this.deleteLevelsHandler.deleteLevels(request);
	}	

	// </editor-fold>	

}

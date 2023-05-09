/*
 * Copyright (C) 2021 Second Mile
 *
 * This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0.
 * If a copy of the MPL was not distributed with this file,
 * You can obtain one at http://mozilla.org/MPL/2.0/.
 */
package ke.co.miles.levels.repository;


import ke.co.miles.levels.models.Level;
import ke.co.miles.levels.repository.deletion.DeleteLevelQuery;
import ke.co.miles.levels.repository.deletion.DeleteLevelsQuery;
import ke.co.miles.levels.repository.insertion.InsertLevelQuery;
import ke.co.miles.levels.repository.insertion.InsertLevelsQuery;
import ke.co.miles.levels.repository.selection.SelectLevelQuery;
import ke.co.miles.levels.repository.selection.SelectLevelsQuery;
import ke.co.miles.levels.repository.selection.SelectTotalLevelsQuery;
import ke.co.miles.levels.repository.updation.UpdateLevelQuery;
import ke.co.miles.levels.repository.updation.UpdateLevelsQuery;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;
import org.springframework.util.MultiValueMap;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

/**
 * @since 1.0
 * @author Kwaje Anthony <tony@miles.co.ke>
 * @version 1.0
 */
@Component
@Slf4j
public class LevelsRepository {

	@Autowired
	InsertLevelQuery insertLevelQuery;
	
	@Autowired
	InsertLevelsQuery insertLevelsQuery;
	
	@Autowired
	SelectLevelQuery selectLevelQuery;
	
	@Autowired
	SelectLevelsQuery selectLevelsQuery;

	@Autowired
	SelectTotalLevelsQuery selectTotalLevelsQuery;

	@Autowired
	UpdateLevelQuery updateLevelQuery;
	
	@Autowired
	UpdateLevelsQuery updateLevelsQuery;
	
	@Autowired
	DeleteLevelQuery deleteLevelQuery;
	
	@Autowired
    DeleteLevelsQuery deleteLevelsQuery;

	public Mono<Long> insertLevel(String database, Level level) {
		return insertLevelQuery.insertLevel(database, level);
	}
	
	public Flux<Long> insertLevels(String database, Level[] levels) {
		return insertLevelsQuery.insertLevels(database, levels);
	}

	public Mono<Level> selectLevel(String database, Long id) {
		return selectLevelQuery.selectLevel(database, id);
	}
	
	public Flux<Level> selectLevels(String database, MultiValueMap<String,String> parameters) {
		return selectLevelsQuery.selectLevels(database, parameters);
	}

	public Mono<Long> selectTotalLevels(String database, MultiValueMap<String,String> parameters) {
		return selectTotalLevelsQuery.selectTotalLevels(database, parameters);
	}

	public Mono<Integer> updateLevel(String database, Level level) {
		return updateLevelQuery.updateLevel(database, level);
	}
	
	public Flux<Integer> updateLevels(String database, Level[] levels) {
		return updateLevelsQuery.updateLevels(database, levels);
	}	
	
	public Mono<Integer> deleteLevelById(String database, Long id) {
		return deleteLevelQuery.deleteLevel(database, id);
	}
	
	public Mono<Integer> deleteLevels(String database, MultiValueMap<String,String> parameters) {
		return deleteLevelsQuery.deleteLevels(database, parameters);
	}

}

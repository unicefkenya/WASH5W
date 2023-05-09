/*
 * Copyright (C) 2021 Second Mile
 *
 * This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0.
 * If a copy of the MPL was not distributed with this file,
 * You can obtain one at http://mozilla.org/MPL/2.0/.
 */
package ke.co.miles.types.repository;


import ke.co.miles.types.models.Type;
import ke.co.miles.types.repository.selection.SelectTotalTypesQuery;
import ke.co.miles.types.repository.updation.UpdateTypeQuery;
import ke.co.miles.types.repository.updation.UpdateTypesQuery;
import ke.co.miles.types.repository.deletion.DeleteTypeQuery;
import ke.co.miles.types.repository.deletion.DeleteTypesQuery;
import ke.co.miles.types.repository.selection.SelectTypesQuery;
import ke.co.miles.types.repository.insertion.InsertTypeQuery;
import ke.co.miles.types.repository.insertion.InsertTypesQuery;
import ke.co.miles.types.repository.selection.SelectTypeQuery;
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
public class TypesRepository {

	@Autowired
	InsertTypeQuery insertTypeQuery;
	
	@Autowired
	InsertTypesQuery insertTypesQuery;
	
	@Autowired
	SelectTypeQuery selectTypeQuery;
	
	@Autowired
	SelectTypesQuery selectTypesQuery;

	@Autowired
	SelectTotalTypesQuery selectTotalTypesQuery;

	@Autowired
	UpdateTypeQuery updateTypeQuery;
	
	@Autowired
	UpdateTypesQuery updateTypesQuery;
	
	@Autowired
	DeleteTypeQuery deleteTypeQuery;
	
	@Autowired
    DeleteTypesQuery deleteTypesQuery;

	public Mono<Long> insertType(String database, Type type) {
		return insertTypeQuery.insertType(database, type);
	}
	
	public Flux<Long> insertTypes(String database, Type[] types) {
		return insertTypesQuery.insertTypes(database, types);
	}

	public Mono<Type> selectType(String database, Long id) {
		return selectTypeQuery.selectType(database, id);
	}
	
	public Flux<Type> selectTypes(String database, MultiValueMap<String,String> parameters) {
		return selectTypesQuery.selectTypes(database, parameters);
	}

	public Mono<Long> selectTotalTypes(String database, MultiValueMap<String,String> parameters) {
		return selectTotalTypesQuery.selectTotalTypes(database, parameters);
	}

	public Mono<Integer> updateType(String database, Type type) {
		return updateTypeQuery.updateType(database, type);
	}
	
	public Flux<Integer> updateTypes(String database, Type[] types) {
		return updateTypesQuery.updateTypes(database, types);
	}	
	
	public Mono<Integer> deleteTypeById(String database, Long id) {
		return deleteTypeQuery.deleteType(database, id);
	}
	
	public Mono<Integer> deleteTypes(String database, MultiValueMap<String,String> parameters) {
		return deleteTypesQuery.deleteTypes(database, parameters);
	}

}

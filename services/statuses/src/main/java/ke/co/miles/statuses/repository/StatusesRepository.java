/*
 * Copyright (C) 2021 Second Mile
 *
 * This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0.
 * If a copy of the MPL was not distributed with this file,
 * You can obtain one at http://mozilla.org/MPL/2.0/.
 */
package ke.co.miles.statuses.repository;


import ke.co.miles.statuses.models.Status;
import ke.co.miles.statuses.repository.deletion.DeleteStatusQuery;
import ke.co.miles.statuses.repository.deletion.DeleteStatusesQuery;
import ke.co.miles.statuses.repository.insertion.InsertStatusQuery;
import ke.co.miles.statuses.repository.insertion.InsertStatusesQuery;
import ke.co.miles.statuses.repository.selection.SelectStatusQuery;
import ke.co.miles.statuses.repository.selection.SelectStatusesQuery;
import ke.co.miles.statuses.repository.selection.SelectTotalStatusesQuery;
import ke.co.miles.statuses.repository.updation.UpdateStatusQuery;
import ke.co.miles.statuses.repository.updation.UpdateStatusesQuery;
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
public class StatusesRepository {

	@Autowired
	InsertStatusQuery insertStatusQuery;
	
	@Autowired
	InsertStatusesQuery insertStatusesQuery;
	
	@Autowired
	SelectStatusQuery selectStatusQuery;
	
	@Autowired
	SelectStatusesQuery selectStatusesQuery;

	@Autowired
	SelectTotalStatusesQuery selectTotalStatusesQuery;

	@Autowired
	UpdateStatusQuery updateStatusQuery;
	
	@Autowired
	UpdateStatusesQuery updateStatusesQuery;
	
	@Autowired
	DeleteStatusQuery deleteStatusQuery;
	
	@Autowired
    DeleteStatusesQuery deleteStatusesQuery;

	public Mono<Long> insertStatus(String database, Status status) {
		return insertStatusQuery.insertStatus(database, status);
	}
	
	public Flux<Long> insertStatuses(String database, Status[] statuses) {
		return insertStatusesQuery.insertStatuses(database, statuses);
	}

	public Mono<Status> selectStatus(String database, Long id) {
		return selectStatusQuery.selectStatus(database, id);
	}
	
	public Flux<Status> selectStatuses(String database, MultiValueMap<String,String> parameters) {
		return selectStatusesQuery.selectStatuses(database, parameters);
	}

	public Mono<Long> selectTotalStatuses(String database, MultiValueMap<String,String> parameters) {
		return selectTotalStatusesQuery.selectTotalStatuses(database, parameters);
	}

	public Mono<Integer> updateStatus(String database, Status status) {
		return updateStatusQuery.updateStatus(database, status);
	}
	
	public Flux<Integer> updateStatuses(String database, Status[] statuses) {
		return updateStatusesQuery.updateStatuses(database, statuses);
	}	
	
	public Mono<Integer> deleteStatusById(String database, Long id) {
		return deleteStatusQuery.deleteStatus(database, id);
	}
	
	public Mono<Integer> deleteStatuses(String database, MultiValueMap<String,String> parameters) {
		return deleteStatusesQuery.deleteStatuses(database, parameters);
	}

}

/*
 * Copyright (C) 2021 Second Mile
 *
 * This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0.
 * If a copy of the MPL was not distributed with this file,
 * You can obtain one at http://mozilla.org/MPL/2.0/.
 */
package ke.co.miles.groups.repository;


import ke.co.miles.groups.models.Group;
import ke.co.miles.groups.repository.selection.SelectTotalGroupsQuery;
import ke.co.miles.groups.repository.updation.UpdateGroupQuery;
import ke.co.miles.groups.repository.updation.UpdateGroupsQuery;
import ke.co.miles.groups.repository.deletion.DeleteGroupQuery;
import ke.co.miles.groups.repository.deletion.DeleteGroupsQuery;
import ke.co.miles.groups.repository.selection.SelectGroupsQuery;
import ke.co.miles.groups.repository.insertion.InsertGroupQuery;
import ke.co.miles.groups.repository.insertion.InsertGroupsQuery;
import ke.co.miles.groups.repository.selection.SelectGroupQuery;
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
public class GroupsRepository {

	@Autowired
	InsertGroupQuery insertGroupQuery;
	
	@Autowired
	InsertGroupsQuery insertGroupsQuery;
	
	@Autowired
	SelectGroupQuery selectGroupQuery;
	
	@Autowired
	SelectGroupsQuery selectGroupsQuery;

	@Autowired
	SelectTotalGroupsQuery selectTotalGroupsQuery;

	@Autowired
	UpdateGroupQuery updateGroupQuery;
	
	@Autowired
	UpdateGroupsQuery updateGroupsQuery;
	
	@Autowired
	DeleteGroupQuery deleteGroupQuery;
	
	@Autowired
    DeleteGroupsQuery deleteGroupsQuery;

	public Mono<Long> insertGroup(String database, Group group) {
		return insertGroupQuery.insertGroup(database, group);
	}
	
	public Flux<Long> insertGroups(String database, Group[] groups) {
		return insertGroupsQuery.insertGroups(database, groups);
	}

	public Mono<Group> selectGroup(String database, Long id) {
		return selectGroupQuery.selectGroup(database, id);
	}
	
	public Flux<Group> selectGroups(String database, MultiValueMap<String,String> parameters) {
		return selectGroupsQuery.selectGroups(database, parameters);
	}

	public Mono<Long> selectTotalGroups(String database, MultiValueMap<String,String> parameters) {
		return selectTotalGroupsQuery.selectTotalGroups(database, parameters);
	}

	public Mono<Integer> updateGroup(String database, Group group) {
		return updateGroupQuery.updateGroup(database, group);
	}
	
	public Flux<Integer> updateGroups(String database, Group[] groups) {
		return updateGroupsQuery.updateGroups(database, groups);
	}	
	
	public Mono<Integer> deleteGroupById(String database, Long id) {
		return deleteGroupQuery.deleteGroup(database, id);
	}
	
	public Mono<Integer> deleteGroups(String database, MultiValueMap<String,String> parameters) {
		return deleteGroupsQuery.deleteGroups(database, parameters);
	}

}

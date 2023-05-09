/*
 * Copyright (C) 2021 Second Mile
 *
 * This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0.
 * If a copy of the MPL was not distributed with this file,
 * You can obtain one at http://mozilla.org/MPL/2.0/.
 */
package ke.co.miles.roles.repository;


import ke.co.miles.roles.models.Role;
import ke.co.miles.roles.repository.deletion.DeleteRoleQuery;
import ke.co.miles.roles.repository.deletion.DeleteRolesQuery;
import ke.co.miles.roles.repository.insertion.InsertRoleQuery;
import ke.co.miles.roles.repository.insertion.InsertRolesQuery;
import ke.co.miles.roles.repository.selection.SelectRoleQuery;
import ke.co.miles.roles.repository.selection.SelectRolesQuery;
import ke.co.miles.roles.repository.selection.SelectTotalRolesQuery;
import ke.co.miles.roles.repository.updation.UpdateRoleQuery;
import ke.co.miles.roles.repository.updation.UpdateRolesQuery;
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
public class RolesRepository {

	@Autowired
	InsertRoleQuery insertRoleQuery;
	
	@Autowired
	InsertRolesQuery insertRolesQuery;
	
	@Autowired
	SelectRoleQuery selectRoleQuery;
	
	@Autowired
	SelectRolesQuery selectRolesQuery;

	@Autowired
	SelectTotalRolesQuery selectTotalRolesQuery;

	@Autowired
	UpdateRoleQuery updateRoleQuery;
	
	@Autowired
	UpdateRolesQuery updateRolesQuery;
	
	@Autowired
	DeleteRoleQuery deleteRoleQuery;
	
	@Autowired
    DeleteRolesQuery deleteRolesQuery;

	public Mono<Long> insertRole(String database, Role role) {
		return insertRoleQuery.insertRole(database, role);
	}
	
	public Flux<Long> insertRoles(String database, Role[] roles) {
		return insertRolesQuery.insertRoles(database, roles);
	}

	public Mono<Role> selectRole(String database, Long id) {
		return selectRoleQuery.selectRole(database, id);
	}
	
	public Flux<Role> selectRoles(String database, MultiValueMap<String,String> parameters) {
		return selectRolesQuery.selectRoles(database, parameters);
	}

	public Mono<Long> selectTotalRoles(String database, MultiValueMap<String,String> parameters) {
		return selectTotalRolesQuery.selectTotalRoles(database, parameters);
	}

	public Mono<Integer> updateRole(String database, Role role) {
		return updateRoleQuery.updateRole(database, role);
	}
	
	public Flux<Integer> updateRoles(String database, Role[] roles) {
		return updateRolesQuery.updateRoles(database, roles);
	}	
	
	public Mono<Integer> deleteRoleById(String database, Long id) {
		return deleteRoleQuery.deleteRole(database, id);
	}
	
	public Mono<Integer> deleteRoles(String database, MultiValueMap<String,String> parameters) {
		return deleteRolesQuery.deleteRoles(database, parameters);
	}

}

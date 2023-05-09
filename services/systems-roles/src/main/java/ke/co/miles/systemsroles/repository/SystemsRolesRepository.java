/*
 * Copyright (C) 2021 Second Mile
 *
 * This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0.
 * If a copy of the MPL was not distributed with this file,
 * You can obtain one at http://mozilla.org/MPL/2.0/.
 */
package ke.co.miles.systemsroles.repository;


import ke.co.miles.systemsroles.models.SystemRole;
import ke.co.miles.systemsroles.repository.deletion.DeleteSystemRoleQuery;
import ke.co.miles.systemsroles.repository.insertion.InsertSystemRoleQuery;
import ke.co.miles.systemsroles.repository.selection.SelectSystemRoleQuery;
import ke.co.miles.systemsroles.repository.selection.SelectSystemsRolesQuery;
import ke.co.miles.systemsroles.repository.selection.SelectTotalSystemsRolesQuery;
import ke.co.miles.systemsroles.repository.updation.UpdateSystemRoleQuery;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;
import org.springframework.util.MultiValueMap;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

/**
 * @author Kwaje Anthony <tony@miles.co.ke>
 * @version 1.0
 * @since 1.0
 */
@Component
@Slf4j
public class SystemsRolesRepository {

  @Autowired
  InsertSystemRoleQuery insertSystemRoleQuery;

  @Autowired
  SelectSystemRoleQuery selectSystemRoleQuery;

  @Autowired
  SelectSystemsRolesQuery selectSystemsRolesQuery;

  @Autowired
  SelectTotalSystemsRolesQuery selectTotalSystemsRolesQuery;

  @Autowired
  UpdateSystemRoleQuery updateSystemRoleQuery;

  @Autowired
  DeleteSystemRoleQuery deleteSystemRoleQuery;

  public Mono<Long> insertSystemRole(SystemRole systemRole) {
    return insertSystemRoleQuery.insertSystemRole(systemRole);
  }

  public Mono<SystemRole> selectSystemRole(Long id) {
    return selectSystemRoleQuery.selectSystemRole(id);
  }

  public Flux<SystemRole> selectSystemsRoles(MultiValueMap<String, String> parameters) {
    return selectSystemsRolesQuery.selectSystemsRoles(parameters);
  }

  public Mono<Long> selectTotalSystemsRoles(MultiValueMap<String, String> parameters) {
    return selectTotalSystemsRolesQuery.selectTotalSystemsRoles(parameters);
  }

  public Mono<Integer> updateSystemRole(SystemRole systemRole) {
    return updateSystemRoleQuery.updateSystemRole(systemRole);
  }

  public Mono<Integer> deleteSystemRoleById(Long id) {
    return deleteSystemRoleQuery.deleteSystemRole(id);
  }


}

/*
 * Copyright (C) 2021 Second Mile
 *
 * This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0.
 * If a copy of the MPL was not distributed with this file,
 * You can obtain one at http://mozilla.org/MPL/2.0/.
 */
package ke.co.miles.systemsmodulespermissions.repository;


import ke.co.miles.systemsmodulespermissions.models.SystemModulePermission;
import ke.co.miles.systemsmodulespermissions.repository.deletion.DeleteSystemModulePermissionQuery;
import ke.co.miles.systemsmodulespermissions.repository.insertion.InsertSystemModulePermissionQuery;
import ke.co.miles.systemsmodulespermissions.repository.selection.SelectSystemModulePermissionQuery;
import ke.co.miles.systemsmodulespermissions.repository.selection.SelectSystemsModulesPermissionsQuery;
import ke.co.miles.systemsmodulespermissions.repository.selection.SelectTotalSystemsModulesPermissionsQuery;
import ke.co.miles.systemsmodulespermissions.repository.updation.UpdateSystemModulePermissionQuery;
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
public class SystemsModulesPermissionsRepository {

  @Autowired
  InsertSystemModulePermissionQuery insertSystemModulePermissionQuery;

  @Autowired
  SelectSystemModulePermissionQuery selectSystemModulePermissionQuery;

  @Autowired
  SelectSystemsModulesPermissionsQuery selectSystemsModulesPermissionsQuery;

  @Autowired
  SelectTotalSystemsModulesPermissionsQuery selectTotalSystemsModulesPermissionsQuery;

  @Autowired
  UpdateSystemModulePermissionQuery updateSystemModulePermissionQuery;

  @Autowired
  DeleteSystemModulePermissionQuery deleteSystemModulePermissionQuery;

  public Mono<Long> insertSystemModulePermission(SystemModulePermission systemModulePermission) {
    return insertSystemModulePermissionQuery.insertSystemModulePermission(systemModulePermission);
  }

  public Mono<SystemModulePermission> selectSystemModulePermission(Long id) {
    return selectSystemModulePermissionQuery.selectSystemModulePermission(id);
  }

  public Flux<SystemModulePermission> selectSystemsModulesPermissions(MultiValueMap<String, String> parameters) {
    return selectSystemsModulesPermissionsQuery.selectSystemsModulesPermissions(parameters);
  }

  public Mono<Long> selectTotalSystemsModulesPermissions(MultiValueMap<String, String> parameters) {
    return selectTotalSystemsModulesPermissionsQuery.selectTotalSystemsModulesPermissions(parameters);
  }

  public Mono<Integer> updateSystemModulePermission(SystemModulePermission systemModulePermission) {
    return updateSystemModulePermissionQuery.updateSystemModulePermission(systemModulePermission);
  }

  public Mono<Integer> deleteSystemModulePermissionById(Long id) {
    return deleteSystemModulePermissionQuery.deleteSystemModulePermission(id);
  }


}

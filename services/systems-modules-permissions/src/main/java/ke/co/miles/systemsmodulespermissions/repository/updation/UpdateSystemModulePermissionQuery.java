/*
 * Copyright (C) 2021 Second Mile
 *
 * This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0.
 * If a copy of the MPL was not distributed with this file,
 * You can obtain one at http://mozilla.org/MPL/2.0/.
 */
package ke.co.miles.systemsmodulespermissions.repository.updation;

import ke.co.miles.systemsmodulespermissions.configurations.DatabaseConfig;
import ke.co.miles.systemsmodulespermissions.models.SystemModulePermission;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;
import reactor.core.publisher.Mono;

/**
 * @author Kwaje Anthony <tony@miles.co.ke>
 * @version 1.0
 * @since 1.0
 */
@Component
@Slf4j
public class UpdateSystemModulePermissionQuery {

  @Autowired
  DatabaseConfig databaseConfig;

  /**
   * Updates a systemModulePermission record
   *
   * @param systemModulePermission   a bean containing the systemModulePermission record details
   * @return the number of systemsModulesPermissions records affected by the query i.e. updated
   */
  public Mono<Integer> updateSystemModulePermission(SystemModulePermission systemModulePermission) {

    log.trace("Entering updateSystemModulePermission()");

    String query = "UPDATE system_module_permission SET data = ?::jsonb WHERE id = ?";

    return
        Mono.from(
            databaseConfig
                .getDatabase()
                .update(query)
                .parameters(
                    systemModulePermission.getData(),
                    systemModulePermission.getId())
                .counts());
  }
}

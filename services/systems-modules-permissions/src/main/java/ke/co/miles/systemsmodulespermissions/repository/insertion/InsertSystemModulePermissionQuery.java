/*
 * Copyright (C) 2021 Second Mile
 *
 * This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0.
 * If a copy of the MPL was not distributed with this file,
 * You can obtain one at http://mozilla.org/MPL/2.0/.
 */
package ke.co.miles.systemsmodulespermissions.repository.insertion;

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
public class InsertSystemModulePermissionQuery {

  @Autowired
  DatabaseConfig databaseConfig;

  /**
   * Inserts a new systemModulePermission record into the database
   *
   * @param systemModulePermission   a bean containing the systemModulePermission record details
   * @return the unique identifier of the newly inserted systemModulePermission record
   */
  public Mono<Long> insertSystemModulePermission(SystemModulePermission systemModulePermission) {

    log.trace("Entering insertSystemModulePermission()");

    String query = "INSERT INTO system_module_permission(data) VALUES(?::jsonb)";

    return
        Mono.from(
            databaseConfig
                .getDatabase()
                .update(query)
                .parameters(
                    systemModulePermission.getData())
                .returnGeneratedKeys()
                .getAs(Long.class));
  }

}

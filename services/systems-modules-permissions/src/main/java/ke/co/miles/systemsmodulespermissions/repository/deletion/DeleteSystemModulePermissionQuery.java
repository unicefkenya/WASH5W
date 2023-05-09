/*
 * Copyright (C) 2021 Second Mile
 *
 * This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0.
 * If a copy of the MPL was not distributed with this file,
 * You can obtain one at http://mozilla.org/MPL/2.0/.
 */
package ke.co.miles.systemsmodulespermissions.repository.deletion;

import ke.co.miles.systemsmodulespermissions.configurations.DatabaseConfig;
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
public class DeleteSystemModulePermissionQuery {

  @Autowired
  DatabaseConfig databaseConfig;

  /**
   * Deletes a systemModulePermission record from the database
   *
   * @param id the unique identifier of the systemModulePermission record to be deleted
   * @return the number of systemsModulesPermissions records affected by the query i.e. deleted
   */
  public Mono<Integer> deleteSystemModulePermission(Long id) {

    log.trace("Entering deleteSystemModulePermission");

    String query = "DELETE FROM system_module_permission WHERE id = ?";

    return
        Mono.from(
            databaseConfig
                .getDatabase()
                .update(query)
                .parameters(id)
                .counts());
  }

}

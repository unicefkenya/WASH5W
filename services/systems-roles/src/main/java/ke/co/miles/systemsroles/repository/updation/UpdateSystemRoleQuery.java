/*
 * Copyright (C) 2021 Second Mile
 *
 * This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0.
 * If a copy of the MPL was not distributed with this file,
 * You can obtain one at http://mozilla.org/MPL/2.0/.
 */
package ke.co.miles.systemsroles.repository.updation;

import ke.co.miles.systemsroles.configurations.DatabaseConfig;
import ke.co.miles.systemsroles.models.SystemRole;
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
public class UpdateSystemRoleQuery {

  @Autowired
  DatabaseConfig databaseConfig;

  /**
   * Updates a systemRole record
   *
   * @param systemRole   a bean containing the systemRole record details
   * @return the number of systemsRoles records affected by the query i.e. updated
   */
  public Mono<Integer> updateSystemRole(SystemRole systemRole) {

    log.trace("Entering updateSystemRole()");

    String query = "UPDATE system_role SET data = ?::jsonb WHERE id = ?";

    return
        Mono.from(
            databaseConfig
                .getDatabase()
                .update(query)
                .parameters(
                    systemRole.getData(),
                    systemRole.getId())
                .counts());
  }
}

/*
 * Copyright (C) 2021 Second Mile
 *
 * This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0.
 * If a copy of the MPL was not distributed with this file,
 * You can obtain one at http://mozilla.org/MPL/2.0/.
 */
package ke.co.miles.systemsroles.repository.insertion;

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
public class InsertSystemRoleQuery {

  @Autowired
  DatabaseConfig databaseConfig;

  /**
   * Inserts a new systemRole record into the database
   *
   * @param systemRole   a bean containing the systemRole record details
   * @return the unique identifier of the newly inserted systemRole record
   */
  public Mono<Long> insertSystemRole(SystemRole systemRole) {

    log.trace("Entering insertSystemRole()");

    String query = "INSERT INTO system_role(data) VALUES(?::jsonb)";

    return
        Mono.from(
            databaseConfig
                .getDatabase()
                .update(query)
                .parameters(
                    systemRole.getData())
                .returnGeneratedKeys()
                .getAs(Long.class));
  }

}

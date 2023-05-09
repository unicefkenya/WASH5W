/*
 * Copyright (C) 2021 Second Mile
 *
 * This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0.
 * If a copy of the MPL was not distributed with this file,
 * You can obtain one at http://mozilla.org/MPL/2.0/.
 */
package ke.co.miles.systemsroles.repository.deletion;

import ke.co.miles.systemsroles.configurations.DatabaseConfig;
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
public class DeleteSystemRoleQuery {

  @Autowired
  DatabaseConfig databaseConfig;

  /**
   * Deletes a systemRole record from the database
   *
   * @param id the unique identifier of the systemRole record to be deleted
   * @return the number of systemsRoles records affected by the query i.e. deleted
   */
  public Mono<Integer> deleteSystemRole(Long id) {

    log.trace("Entering deleteSystemRole");

    String query = "DELETE FROM system_role WHERE id = ?";

    return
        Mono.from(
            databaseConfig
                .getDatabase()
                .update(query)
                .parameters(id)
                .counts());
  }

}

/*
 * Copyright (C) 2021 Second Mile
 *
 * This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0.
 * If a copy of the MPL was not distributed with this file,
 * You can obtain one at http://mozilla.org/MPL/2.0/.
 */
package ke.co.miles.systemsusers.repository.selection;

import ke.co.miles.systemsusers.configurations.DatabaseConfig;
import ke.co.miles.systemsusers.models.SystemUser;
import ke.co.miles.systemsusers.util.builders.SystemUserBuilder;
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
public class SelectSystemUserQuery {

  @Autowired
  DatabaseConfig databaseConfig;

  /**
   * Selects a systemUser record from the database given its unique identifier
   *
   * @param id the unique identifier of the systemUser record to be selected
   * @return the systemUser record with the given id if found
   */
  public Mono<SystemUser> selectSystemUser(Long id) {

    log.trace("Entering selectSystemUser()");

    String query = "SELECT * FROM system_user WHERE id = ?";

    return
        Mono.from(
            databaseConfig
                .getDatabase()
                .select(query)
                .parameters(id)
                .get(rs ->
                    new SystemUserBuilder()
                        .id(rs.getLong("id"))
                        .data(rs.getString("data"))
                        .version(rs.getInt("version"))
                        .build()));
  }

}

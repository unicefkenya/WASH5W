/*
 * Copyright (C) 2021 Second Mile
 *
 * This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0.
 * If a copy of the MPL was not distributed with this file,
 * You can obtain one at http://mozilla.org/MPL/2.0/.
 */
package ke.co.miles.systemmodules.repository.selection;

import ke.co.miles.systemmodules.configurations.DatabaseConfig;
import ke.co.miles.systemmodules.models.SystemModule;
import ke.co.miles.systemmodules.util.builders.SystemModuleBuilder;
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
public class SelectSystemModuleQuery {

  @Autowired
  DatabaseConfig databaseConfig;

  /**
   * Selects a systemModule record from the database given its unique identifier
   *
   * @param id the unique identifier of the systemModule record to be selected
   * @return the systemModule record with the given id if found
   */
  public Mono<SystemModule> selectSystemModule(Long id) {

    log.trace("Entering selectSystemModule()");

    String query = "SELECT * FROM system_module WHERE id = ?";

    return
        Mono.from(
            databaseConfig
                .getDatabase()
                .select(query)
                .parameters(id)
                .get(rs ->
                    new SystemModuleBuilder()
                        .id(rs.getLong("id"))
                        .data(rs.getString("data"))
                        .version(rs.getInt("version"))
                        .build()));
  }

}

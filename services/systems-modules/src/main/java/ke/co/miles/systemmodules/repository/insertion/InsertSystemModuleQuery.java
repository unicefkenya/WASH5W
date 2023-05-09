/*
 * Copyright (C) 2021 Second Mile
 *
 * This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0.
 * If a copy of the MPL was not distributed with this file,
 * You can obtain one at http://mozilla.org/MPL/2.0/.
 */
package ke.co.miles.systemmodules.repository.insertion;

import ke.co.miles.systemmodules.configurations.DatabaseConfig;
import ke.co.miles.systemmodules.models.SystemModule;
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
public class InsertSystemModuleQuery {

  @Autowired
  DatabaseConfig databaseConfig;

  /**
   * Inserts a new systemModule record into the database
   *
   * @param systemModule   a bean containing the systemModule record details
   * @return the unique identifier of the newly inserted systemModule record
   */
  public Mono<Long> insertSystemModule(SystemModule systemModule) {

    log.trace("Entering insertSystemModule()");

    String query = "INSERT INTO system_module(data) VALUES(?::jsonb)";

    return
        Mono.from(
            databaseConfig
                .getDatabase()
                .update(query)
                .parameters(
                    systemModule.getData())
                .returnGeneratedKeys()
                .getAs(Long.class));
  }

}

/*
 * Copyright (C) 2021 Second Mile
 *
 * This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0.
 * If a copy of the MPL was not distributed with this file,
 * You can obtain one at http://mozilla.org/MPL/2.0/.
 */
package ke.co.miles.administrativesystems.repository.insertion;

import ke.co.miles.administrativesystems.configurations.DatabaseConfig;
import ke.co.miles.administrativesystems.models.AdministrativeSystem;
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
public class InsertAdministrativeSystemQuery {

  @Autowired
  DatabaseConfig databaseConfig;

  /**
   * Inserts a new administrativeSystem record into the database
   *
   * @param administrativeSystem   a bean containing the administrativeSystem record details
   * @return the unique identifier of the newly inserted administrativeSystem record
   */
  public Mono<Long> insertAdministrativeSystem(AdministrativeSystem administrativeSystem) {

    log.trace("Entering insertAdministrativeSystem()");

    String query = "INSERT INTO administrative_system(data) VALUES(?::jsonb)";

    return
        Mono.from(
            databaseConfig
                .getDatabase()
                .update(query)
                .parameters(
                    administrativeSystem.getData())
                .returnGeneratedKeys()
                .getAs(Long.class));
  }

}

/*
 * Copyright (C) 2021 Second Mile
 *
 * This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0.
 * If a copy of the MPL was not distributed with this file,
 * You can obtain one at http://mozilla.org/MPL/2.0/.
 */
package ke.co.miles.administrativesystems.repository.updation;

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
public class UpdateAdministrativeSystemQuery {

  @Autowired
  DatabaseConfig databaseConfig;

  /**
   * Updates a administrativeSystem record
   *
   * @param administrativeSystem   a bean containing the administrativeSystem record details
   * @return the number of administrativeSystems records affected by the query i.e. updated
   */
  public Mono<Integer> updateAdministrativeSystem(AdministrativeSystem administrativeSystem) {

    log.trace("Entering updateAdministrativeSystem()");

    String query = "UPDATE administrative_system SET data = ?::jsonb WHERE id = ?";

    return
        Mono.from(
            databaseConfig
                .getDatabase()
                .update(query)
                .parameters(
                    administrativeSystem.getData(),
                    administrativeSystem.getId())
                .counts());
  }
}

/*
 * Copyright (C) 2021 Second Mile
 *
 * This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0.
 * If a copy of the MPL was not distributed with this file,
 * You can obtain one at http://mozilla.org/MPL/2.0/.
 */
package ke.co.miles.administrativesystems.repository.selection;

import ke.co.miles.administrativesystems.configurations.DatabaseConfig;
import ke.co.miles.administrativesystems.models.AdministrativeSystem;
import ke.co.miles.administrativesystems.util.builders.AdministrativeSystemBuilder;
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
public class SelectAdministrativeSystemQuery {

  @Autowired
  DatabaseConfig databaseConfig;

  /**
   * Selects a administrativeSystem record from the database given its unique identifier
   *
   * @param id the unique identifier of the administrativeSystem record to be selected
   * @return the administrativeSystem record with the given id if found
   */
  public Mono<AdministrativeSystem> selectAdministrativeSystem(Long id) {

    log.trace("Entering selectAdministrativeSystem()");

    String query = "SELECT * FROM administrative_system WHERE id = ?";

    return
        Mono.from(
            databaseConfig
                .getDatabase()
                .select(query)
                .parameters(id)
                .get(rs ->
                    new AdministrativeSystemBuilder()
                        .id(rs.getLong("id"))
                        .data(rs.getString("data"))
                        .version(rs.getInt("version"))
                        .build()));
  }

}

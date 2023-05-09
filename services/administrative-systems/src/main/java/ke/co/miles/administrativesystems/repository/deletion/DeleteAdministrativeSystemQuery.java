/*
 * Copyright (C) 2021 Second Mile
 *
 * This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0.
 * If a copy of the MPL was not distributed with this file,
 * You can obtain one at http://mozilla.org/MPL/2.0/.
 */
package ke.co.miles.administrativesystems.repository.deletion;

import ke.co.miles.administrativesystems.configurations.DatabaseConfig;
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
public class DeleteAdministrativeSystemQuery {

  @Autowired
  DatabaseConfig databaseConfig;

  /**
   * Deletes a administrativeSystem record from the database
   *
   * @param id the unique identifier of the administrativeSystem record to be deleted
   * @return the number of administrativeSystems records affected by the query i.e. deleted
   */
  public Mono<Integer> deleteAdministrativeSystem(Long id) {

    log.trace("Entering deleteAdministrativeSystem");

    String query = "DELETE FROM administrative_system WHERE id = ?";

    return
        Mono.from(
            databaseConfig
                .getDatabase()
                .update(query)
                .parameters(id)
                .counts());
  }

}

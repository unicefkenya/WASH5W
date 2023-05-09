/*
 * Copyright (C) 2021 Second Mile
 *
 * This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0.
 * If a copy of the MPL was not distributed with this file,
 * You can obtain one at http://mozilla.org/MPL/2.0/.
 */
package ke.co.miles.administrativeunits.repository.deletion;

import ke.co.miles.administrativeunits.configurations.DatabaseConfig;
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
public class DeleteAdministrativeUnitQuery {

  @Autowired
  DatabaseConfig databaseConfig;

  /**
   * Deletes a administrativeUnit record from the database
   *
   * @param id the unique identifier of the administrativeUnit record to be deleted
   * @return the number of administrativeUnits records affected by the query i.e. deleted
   */
  public Mono<Integer> deleteAdministrativeUnit(Long id) {

    log.trace("Entering deleteAdministrativeUnit");

    String query = "DELETE FROM administrative_unit WHERE id = ?";

    return
        Mono.from(
            databaseConfig
                .getDatabase()
                .update(query)
                .parameters(id)
                .counts());
  }

}

/*
 * Copyright (C) 2021 Second Mile
 *
 * This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0.
 * If a copy of the MPL was not distributed with this file,
 * You can obtain one at http://mozilla.org/MPL/2.0/.
 */
package ke.co.miles.administrativeunits.repository.insertion;

import ke.co.miles.administrativeunits.configurations.DatabaseConfig;
import ke.co.miles.administrativeunits.models.AdministrativeUnit;
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
public class InsertAdministrativeUnitQuery {

  @Autowired
  DatabaseConfig databaseConfig;

  /**
   * Inserts a new administrativeUnit record into the database
   *
   * @param administrativeUnit   a bean containing the administrativeUnit record details
   * @return the unique identifier of the newly inserted administrativeUnit record
   */
  public Mono<Long> insertAdministrativeUnit(AdministrativeUnit administrativeUnit) {

    log.trace("Entering insertAdministrativeUnit()");

    String query = "INSERT INTO administrative_unit(data) VALUES(?::jsonb)";

    return
        Mono.from(
            databaseConfig
                .getDatabase()
                .update(query)
                .parameters(
                    administrativeUnit.getData())
                .returnGeneratedKeys()
                .getAs(Long.class));
  }

}

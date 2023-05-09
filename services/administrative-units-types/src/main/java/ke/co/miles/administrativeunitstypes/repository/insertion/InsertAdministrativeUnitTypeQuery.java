/*
 * Copyright (C) 2021 Second Mile
 *
 * This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0.
 * If a copy of the MPL was not distributed with this file,
 * You can obtain one at http://mozilla.org/MPL/2.0/.
 */
package ke.co.miles.administrativeunitstypes.repository.insertion;

import ke.co.miles.administrativeunitstypes.configurations.DatabaseConfig;
import ke.co.miles.administrativeunitstypes.models.AdministrativeUnitType;
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
public class InsertAdministrativeUnitTypeQuery {

  @Autowired
  DatabaseConfig databaseConfig;

  /**
   * Inserts a new administrativeUnitType record into the database
   *
   * @param administrativeUnitType   a bean containing the administrativeUnitType record details
   * @return the unique identifier of the newly inserted administrativeUnitType record
   */
  public Mono<Long> insertAdministrativeUnitType(AdministrativeUnitType administrativeUnitType) {

    log.trace("Entering insertAdministrativeUnitType()");

    String query = "INSERT INTO administrative_unit_type(data) VALUES(?::jsonb)";

    return
        Mono.from(
            databaseConfig
                .getDatabase()
                .update(query)
                .parameters(
                    administrativeUnitType.getData())
                .returnGeneratedKeys()
                .getAs(Long.class));
  }

}

/*
 * Copyright (C) 2021 Second Mile
 *
 * This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0.
 * If a copy of the MPL was not distributed with this file,
 * You can obtain one at http://mozilla.org/MPL/2.0/.
 */
package ke.co.miles.administrativeunitstypes.repository.updation;

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
public class UpdateAdministrativeUnitTypeQuery {

  @Autowired
  DatabaseConfig databaseConfig;

  /**
   * Updates a administrativeUnitType record
   *
   * @param administrativeUnitType   a bean containing the administrativeUnitType record details
   * @return the number of administrativeUnitsTypes records affected by the query i.e. updated
   */
  public Mono<Integer> updateAdministrativeUnitType(AdministrativeUnitType administrativeUnitType) {

    log.trace("Entering updateAdministrativeUnitType()");

    String query = "UPDATE administrative_unit_type SET data = ?::jsonb WHERE id = ?";

    return
        Mono.from(
            databaseConfig
                .getDatabase()
                .update(query)
                .parameters(
                    administrativeUnitType.getData(),
                    administrativeUnitType.getId())
                .counts());
  }
}

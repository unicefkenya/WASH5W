/*
 * Copyright (C) 2021 Second Mile
 *
 * This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0.
 * If a copy of the MPL was not distributed with this file,
 * You can obtain one at http://mozilla.org/MPL/2.0/.
 */
package ke.co.miles.administrativestructures.repository.updation;

import ke.co.miles.administrativestructures.configurations.DatabaseConfig;
import ke.co.miles.administrativestructures.models.AdministrativeStructure;
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
public class UpdateAdministrativeStructureQuery {

  @Autowired
  DatabaseConfig databaseConfig;

  /**
   * Updates a administrativeStructure record
   *
   * @param administrativeStructure   a bean containing the administrativeStructure record details
   * @return the number of administrativeStructures records affected by the query i.e. updated
   */
  public Mono<Integer> updateAdministrativeStructure(AdministrativeStructure administrativeStructure) {

    log.trace("Entering updateAdministrativeStructure()");

    String query = "UPDATE administrative_structure SET data = ?::jsonb WHERE id = ?";

    return
        Mono.from(
            databaseConfig
                .getDatabase()
                .update(query)
                .parameters(
                    administrativeStructure.getData(),
                    administrativeStructure.getId())
                .counts());
  }
}

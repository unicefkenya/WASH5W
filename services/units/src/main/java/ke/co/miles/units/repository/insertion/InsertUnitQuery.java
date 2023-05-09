/*
 * Copyright (C) 2021 Second Mile
 *
 * This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0.
 * If a copy of the MPL was not distributed with this file,
 * You can obtain one at http://mozilla.org/MPL/2.0/.
 */
package ke.co.miles.units.repository.insertion;

import ke.co.miles.units.configurations.DatabaseConfig;
import ke.co.miles.units.models.Unit;
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
public class InsertUnitQuery {

  @Autowired
  DatabaseConfig databaseConfig;

  /**
   * Inserts a new unit record into the database
   *
   * @param unit   a bean containing the unit record details
   * @return the unique identifier of the newly inserted unit record
   */
  public Mono<Long> insertUnit(Unit unit) {

    log.trace("Entering insertUnit()");

    String query = "INSERT INTO unit(data) VALUES(?::jsonb)";

    return
        Mono.from(
            databaseConfig
                .getDatabase()
                .update(query)
                .parameters(
                    unit.getData())
                .returnGeneratedKeys()
                .getAs(Long.class));
  }

}

/*
 * Copyright (C) 2021 Second Mile
 *
 * This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0.
 * If a copy of the MPL was not distributed with this file,
 * You can obtain one at http://mozilla.org/MPL/2.0/.
 */
package ke.co.miles.entitiestypes.repository.insertion;

import ke.co.miles.entitiestypes.configurations.DatabaseConfig;
import ke.co.miles.entitiestypes.models.EntityType;
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
public class InsertEntityTypeQuery {

  @Autowired
  DatabaseConfig databaseConfig;

  /**
   * Inserts a new entityType record into the database
   *
   * @param entityType   a bean containing the entityType record details
   * @return the unique identifier of the newly inserted entityType record
   */
  public Mono<Long> insertEntityType(EntityType entityType) {

    log.trace("Entering insertEntityType()");

    String query = "INSERT INTO entity_type(data) VALUES(?::jsonb)";

    return
        Mono.from(
            databaseConfig
                .getDatabase()
                .update(query)
                .parameters(
                    entityType.getData())
                .returnGeneratedKeys()
                .getAs(Long.class));
  }

}

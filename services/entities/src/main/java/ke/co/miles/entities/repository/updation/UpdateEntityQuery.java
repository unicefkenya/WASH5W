/*
 * Copyright (C) 2021 Second Mile
 *
 * This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0.
 * If a copy of the MPL was not distributed with this file,
 * You can obtain one at http://mozilla.org/MPL/2.0/.
 */
package ke.co.miles.entities.repository.updation;

import ke.co.miles.entities.configurations.DatabaseConfig;
import ke.co.miles.entities.models.Entity;
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
public class UpdateEntityQuery {

  @Autowired
  DatabaseConfig databaseConfig;

  /**
   * Updates an entity record
   *
   * @param database the name of the database to which the entity record update should be made
   * @param entity   a bean containing the entity record details
   * @return the number of entities records affected by the query i.e. updated
   */
  public Mono<Integer> updateEntity(String database, Entity entity) {

    log.trace("Entering updateEntity()");

    String query = "UPDATE entity SET data = ?::jsonb WHERE id = ?";

    return
        Mono.from(
            databaseConfig
                .getDatabase(database)
                .update(query)
                .parameters(
                    entity.getData(),
                    entity.getId())
                .counts());
  }
}

/*
 * Copyright (C) 2021 Second Mile
 *
 * This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0.
 * If a copy of the MPL was not distributed with this file,
 * You can obtain one at http://mozilla.org/MPL/2.0/.
 */
package ke.co.miles.entities.repository.selection;

import ke.co.miles.entities.configurations.DatabaseConfig;
import ke.co.miles.entities.models.Entity;
import ke.co.miles.entities.util.builders.EntityBuilder;
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
public class SelectEntityQuery {

  @Autowired
  DatabaseConfig databaseConfig;

  /**
   * Selects an entity record from the database given its unique identifier
   *
   * @param database the name of the database from which the entity record should be selected
   * @param id       the unique identifier of the entity record to be selected
   * @return the entity record with the given id if found
   */
  public Mono<Entity> selectEntity(String database, Long id) {

    log.trace("Entering selectEntity()");

    String query = "SELECT * FROM entity WHERE id = ?";

    return
        Mono.from(
            databaseConfig
                .getDatabase(database)
                .select(query)
                .parameters(id)
                .get(rs ->
                    new EntityBuilder()
                        .id(rs.getLong("id"))
                        .data(rs.getString("data"))
                        .version(rs.getInt("version"))
                        .build()));
  }

}

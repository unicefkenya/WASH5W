/*
 * Copyright (C) 2021 Second Mile
 *
 * This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0.
 * If a copy of the MPL was not distributed with this file,
 * You can obtain one at http://mozilla.org/MPL/2.0/.
 */
package ke.co.miles.entities.repository.deletion;

import ke.co.miles.entities.configurations.DatabaseConfig;
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
public class DeleteEntityQuery {

  @Autowired
  DatabaseConfig databaseConfig;

  /**
   * Deletes an entity record from the database
   *
   * @param database the name of the database from which the entity record deletion should be made
   * @param id       the unique identifier of the entity record to be deleted
   * @return the number of entities records affected by the query i.e. deleted
   */
  public Mono<Integer> deleteEntity(String database, Long id) {

    log.trace("Entering deleteEntity");

    String query = "DELETE FROM entity WHERE id = ?";

    return
        Mono.from(
            databaseConfig
                .getDatabase(database)
                .update(query)
                .parameters(id)
                .counts());
  }

}

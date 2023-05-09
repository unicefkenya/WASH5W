/*
 * Copyright (C) 2021 Second Mile
 *
 * This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0.
 * If a copy of the MPL was not distributed with this file,
 * You can obtain one at http://mozilla.org/MPL/2.0/.
 */
package ke.co.miles.entitiestypes.repository.updation;

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
public class UpdateEntityTypeQuery {

  @Autowired
  DatabaseConfig databaseConfig;

  /**
   * Updates a entityType record
   *
   * @param entityType   a bean containing the entityType record details
   * @return the number of entitiesTypes records affected by the query i.e. updated
   */
  public Mono<Integer> updateEntityType(EntityType entityType) {

    log.trace("Entering updateEntityType()");

    String query = "UPDATE entity_type SET data = ?::jsonb WHERE id = ?";

    return
        Mono.from(
            databaseConfig
                .getDatabase()
                .update(query)
                .parameters(
                    entityType.getData(),
                    entityType.getId())
                .counts());
  }
}

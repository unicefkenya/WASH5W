/*
 * Copyright (C) 2021 Second Mile
 *
 * This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0.
 * If a copy of the MPL was not distributed with this file,
 * You can obtain one at http://mozilla.org/MPL/2.0/.
 */
package ke.co.miles.logicalhierarchies.repository.insertion;

import ke.co.miles.logicalhierarchies.configurations.DatabaseConfig;
import ke.co.miles.logicalhierarchies.models.LogicalHierarchy;
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
public class InsertLogicalHierarchyQuery {

  @Autowired
  DatabaseConfig databaseConfig;

  /**
   * Inserts a new logicalHierarchy record into the database
   *
   * @param logicalHierarchy   a bean containing the logicalHierarchy record details
   * @return the unique identifier of the newly inserted logicalHierarchy record
   */
  public Mono<Long> insertLogicalHierarchy(LogicalHierarchy logicalHierarchy) {

    log.trace("Entering insertLogicalHierarchy()");

    String query = "INSERT INTO logical_hierarchy(data) VALUES(?::jsonb)";

    return
        Mono.from(
            databaseConfig
                .getDatabase()
                .update(query)
                .parameters(
                    logicalHierarchy.getData())
                .returnGeneratedKeys()
                .getAs(Long.class));
  }

}

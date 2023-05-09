/*
 * Copyright (C) 2021 Second Mile
 *
 * This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0.
 * If a copy of the MPL was not distributed with this file,
 * You can obtain one at http://mozilla.org/MPL/2.0/.
 */
package ke.co.miles.logicalhierarchies.repository.selection;

import ke.co.miles.logicalhierarchies.configurations.DatabaseConfig;
import ke.co.miles.logicalhierarchies.models.LogicalHierarchy;
import ke.co.miles.logicalhierarchies.util.builders.LogicalHierarchyBuilder;
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
public class SelectLogicalHierarchyQuery {

  @Autowired
  DatabaseConfig databaseConfig;

  /**
   * Selects a logicalHierarchy record from the database given its unique identifier
   *
   * @param id the unique identifier of the logicalHierarchy record to be selected
   * @return the logicalHierarchy record with the given id if found
   */
  public Mono<LogicalHierarchy> selectLogicalHierarchy(Long id) {

    log.trace("Entering selectLogicalHierarchy()");

    String query = "SELECT * FROM logical_hierarchy WHERE id = ?";

    return
        Mono.from(
            databaseConfig
                .getDatabase()
                .select(query)
                .parameters(id)
                .get(rs ->
                    new LogicalHierarchyBuilder()
                        .id(rs.getLong("id"))
                        .data(rs.getString("data"))
                        .version(rs.getInt("version"))
                        .build()));
  }

}

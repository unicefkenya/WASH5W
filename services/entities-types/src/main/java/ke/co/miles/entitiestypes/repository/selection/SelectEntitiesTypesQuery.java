/*
 * Copyright (C) 2021 Second Mile
 *
 * This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0.
 * If a copy of the MPL was not distributed with this file,
 * You can obtain one at http://mozilla.org/MPL/2.0/.
 */
package ke.co.miles.entitiestypes.repository.selection;

import ke.co.miles.entitiestypes.configurations.DatabaseConfig;
import ke.co.miles.entitiestypes.models.EntityType;
import ke.co.miles.entitiestypes.util.builders.EntityTypeBuilder;
import ke.co.miles.entitiestypes.util.builders.QueryPaginationClauseBuilder;
import ke.co.miles.entitiestypes.util.builders.QueryWhereClauseBuilder;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;
import org.springframework.util.MultiValueMap;
import reactor.core.publisher.Flux;

/**
 * @author Kwaje Anthony <tony@miles.co.ke>
 * @version 1.0
 * @since 1.0
 */
@Component
@Slf4j
public class SelectEntitiesTypesQuery {

  @Autowired
  DatabaseConfig databaseConfig;

  /**
   * Selects all or specific entitiesTypes records from the database depending on whether query
   * parameters were supplied as part of the query
   *
   * @param parameters the query parameters passed along with the request
   * @return a list of entitiesTypes records if found
   */
  public Flux<EntityType> selectEntitiesTypes(MultiValueMap<String, String> parameters) {

    log.trace("Entering selectEntitiesTypes()");

    String query =
        "SELECT * FROM entity_type" +
            new QueryWhereClauseBuilder().queryParameters(parameters).build() +
            " ORDER BY id ASC" +
            new QueryPaginationClauseBuilder().queryParameters(parameters).build();

    return
        Flux.from(
            databaseConfig
                .getDatabase()
                .select(query)
                .get(rs ->
                    new EntityTypeBuilder()
                        .id(rs.getLong("id"))
                        .data(rs.getString("data"))
                        .version(rs.getInt("version"))
                        .build()));
  }

}

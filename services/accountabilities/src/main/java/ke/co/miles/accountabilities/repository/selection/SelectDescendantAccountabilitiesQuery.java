/*
 * Copyright (C) 2021 Second Mile
 *
 * This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0.
 * If a copy of the MPL was not distributed with this file,
 * You can obtain one at http://mozilla.org/MPL/2.0/.
 */
package ke.co.miles.accountabilities.repository.selection;

import ke.co.miles.accountabilities.configurations.DatabaseConfig;
import ke.co.miles.accountabilities.models.Accountability;
import ke.co.miles.accountabilities.util.builders.AccountabilityBuilder;
import ke.co.miles.accountabilities.util.builders.QueryPaginationClauseBuilder;
import ke.co.miles.accountabilities.util.builders.QueryWhereClauseBuilder;
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
public class SelectDescendantAccountabilitiesQuery {

  @Autowired
  DatabaseConfig databaseConfig;

  /**
   * Selects accountabilities descendant records from the database depending on whether path
   * and query parameters were supplied as part of the query
   *
   * @param database     the name of the database from which the accountabilities records
   *                     should be selected
   * @param type    the unique identifier of the accountability type whose descendant
   *                     accountabilities records should be selected
   * @param commissioner the unique identifier of the parent entity type whose descendant
   *                     accountabilities records should be retrieved
   * @param parameters   the query parameters passed along with the request
   * @return a list of descendant accountabilities records if found
   */
  public Flux<Accountability> selectDescendantAccountabilities(String database,
      Long type, Long commissioner, MultiValueMap<String, String> parameters) {

    log.trace("Entering selectDescendantAccountabilities()");

    String query = "WITH RECURSIVE descendants AS ( "
        + "SELECT id, 0 as level, data, version " +
        "FROM accountability " +
        "WHERE data -> 'type' ->> 'id' = '" + type + "' " +
        "AND data -> 'commissioner' ->> 'id' = '" + commissioner + "' " +
        "UNION ALL " +
        "SELECT e.id, level+1, e.data, e.version " +
        "FROM accountability e " +
        "INNER JOIN descendants s ON s.data -> 'responsible' ->> 'id' = e.data -> 'commissioner' ->> 'id' " +
        ")" +
        "SELECT * FROM descendants" +
        new QueryWhereClauseBuilder().queryParameters(parameters).buildForLevelOnly() +
        " ORDER BY data -> 'commissioner' ->> 'id', data -> 'responsible' ->> 'id' " +
        new QueryPaginationClauseBuilder().queryParameters(parameters).build();

    return
        Flux.from(
            databaseConfig
                .getDatabase(database)
                .select(query)
                .get(rs ->
                    new AccountabilityBuilder()
                        .id(rs.getLong("id"))
                        .level(rs.getInt("level"))
                        .data(rs.getString("data"))
                        .version(rs.getInt("version"))
                        .build()));
  }


}

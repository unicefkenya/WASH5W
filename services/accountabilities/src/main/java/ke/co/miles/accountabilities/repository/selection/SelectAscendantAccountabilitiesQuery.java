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
public class SelectAscendantAccountabilitiesQuery {

  @Autowired
  DatabaseConfig databaseConfig;

  /**
   * Selects accountabilities ascendant records from the database depending on whether path
   * and query parameters were supplied as part of the query
   *
   * @param database    the name of the database from which the accountabilities records
   *                    should be selected
   * @param type   the unique identifier of the accountability type whose ascendant
   *                    accountabilities records should be selected
   * @param responsible the unique identifier of the subsidiary entity type whose ascendant
   *                    accountabilities records should be retrieved
   * @param parameters  the query parameters passed along with the request
   * @return a list of ascendant accountabilities records if found
   */
  public Flux<Accountability> selectAscendantAccountabilities(String database,
      Long type, Long responsible, MultiValueMap<String, String> parameters) {

    log.trace("Entering selectAscendantAccountabilities()");

    String query = "WITH RECURSIVE ascendants AS ( "
        + "SELECT id, 0 as level, data, version " +
        "FROM accountability " +
        "WHERE data -> 'type' ->> 'id' = '" + type + "' " +
        "AND data -> 'responsible' ->> 'id' = '" + responsible + "' " +
        "UNION ALL " +
        "SELECT e.id, level+1, e.data, e.version " +
        "FROM accountability e " +
        "INNER JOIN ascendants s ON s.data -> 'commissioner' ->> 'id' = e.data -> 'responsible' ->> 'id' " +
        ")" +
        "SELECT * FROM ascendants" +
        new QueryWhereClauseBuilder().queryParameters(parameters).buildForLevelOnly() +
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

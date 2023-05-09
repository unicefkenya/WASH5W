/*
 * Copyright (C) 2021 Second Mile
 *
 * This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0.
 * If a copy of the MPL was not distributed with this file,
 * You can obtain one at http://mozilla.org/MPL/2.0/.
 */
package ke.co.miles.accountabilitiestypes.repository.selection;

import ke.co.miles.accountabilitiestypes.configurations.DatabaseConfig;
import ke.co.miles.accountabilitiestypes.models.AccountabilityType;
import ke.co.miles.accountabilitiestypes.util.builders.AccountabilityTypeBuilder;
import ke.co.miles.accountabilitiestypes.util.builders.QueryPaginationClauseBuilder;
import ke.co.miles.accountabilitiestypes.util.builders.QueryWhereClauseBuilder;
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
public class SelectAscendantAccountabilitiesTypesQuery {

  @Autowired
  DatabaseConfig databaseConfig;

  /**
   * Selects accountabilities types ascendant records from the database depending on whether path
   * and query parameters were supplied as part of the query
   *
   * @param database    the name of the database from which the accountabilities types records
   *                    should be selected
   * @param hierarchy   the unique identifier of the administrative hierarchy whose ascendant
   *                    accountabilities types records should be selected
   * @param responsible the unique identifier of the subsidiary entity type whose ascendant
   *                    accountabilities types records should be retrieved
   * @param parameters  the query parameters passed along with the request
   * @return a list of ascendant accountabilities types records if found
   */
  public Flux<AccountabilityType> selectAscendantAccountabilitiesTypes(String database,
      Long hierarchy, Long responsible, MultiValueMap<String, String> parameters) {

    log.trace("Entering selectAscendantAccountabilitiesTypes()");

    String query = "WITH RECURSIVE ascendants AS ( "
        + "SELECT id, 0 as level, data, version " +
        "FROM accountability_type " +
        "WHERE data -> 'hierarchy' ->> 'id' = '" + hierarchy + "' " +
        "AND data -> 'responsible' ->> 'id' = '" + responsible + "' " +
        "UNION ALL " +
        "SELECT e.id, level+1, e.data, e.version " +
        "FROM accountability_type e " +
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
                    new AccountabilityTypeBuilder()
                        .id(rs.getLong("id"))
                        .level(rs.getInt("level"))
                        .data(rs.getString("data"))
                        .version(rs.getInt("version"))
                        .build()));
  }


}

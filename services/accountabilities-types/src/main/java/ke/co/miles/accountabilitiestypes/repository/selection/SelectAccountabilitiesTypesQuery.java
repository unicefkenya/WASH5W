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
public class SelectAccountabilitiesTypesQuery {

  @Autowired
  DatabaseConfig databaseConfig;

  /**
   * Selects all or specific accountabilities types records from the database depending on whether
   * query parameters were supplied as part of the query
   *
   * @param database   the name of the database from which the accountabilities types records should
   *                   be selected
   * @param parameters the query parameters passed along with the request
   * @return a list of accountabilities types records if found
   */
  public Flux<AccountabilityType> selectAccountabilitiesTypes(String database,
      MultiValueMap<String, String> parameters) {

    log.trace("Entering selectAccountabilitiesTypes()");

    String query =
        "SELECT * FROM accountability_type" +
            new QueryWhereClauseBuilder().queryParameters(parameters).build() +
            " ORDER BY id ASC" +
            new QueryPaginationClauseBuilder().queryParameters(parameters).build();

    return
        Flux.from(
            databaseConfig
                .getDatabase(database)
                .select(query)
                .get(rs ->
                    new AccountabilityTypeBuilder()
                        .id(rs.getLong("id"))
                        .data(rs.getString("data"))
                        .version(rs.getInt("version"))
                        .build()));
  }

}

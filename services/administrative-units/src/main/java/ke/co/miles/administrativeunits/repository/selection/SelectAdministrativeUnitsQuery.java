/*
 * Copyright (C) 2021 Second Mile
 *
 * This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0.
 * If a copy of the MPL was not distributed with this file,
 * You can obtain one at http://mozilla.org/MPL/2.0/.
 */
package ke.co.miles.administrativeunits.repository.selection;

import ke.co.miles.administrativeunits.configurations.DatabaseConfig;
import ke.co.miles.administrativeunits.models.AdministrativeUnit;
import ke.co.miles.administrativeunits.util.builders.AdministrativeUnitBuilder;
import ke.co.miles.administrativeunits.util.builders.QueryPaginationClauseBuilder;
import ke.co.miles.administrativeunits.util.builders.QueryWhereClauseBuilder;
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
public class SelectAdministrativeUnitsQuery {

  @Autowired
  DatabaseConfig databaseConfig;

  /**
   * Selects all or specific administrativeUnits records from the database depending on whether query
   * parameters were supplied as part of the query
   *
   * @param parameters the query parameters passed along with the request
   * @return a list of administrativeUnits records if found
   */
  public Flux<AdministrativeUnit> selectAdministrativeUnits(MultiValueMap<String, String> parameters) {

    log.trace("Entering selectAdministrativeUnits()");

    String query =
        "SELECT * FROM administrative_unit" +
            new QueryWhereClauseBuilder().queryParameters(parameters).build() +
            " ORDER BY id ASC" +
            new QueryPaginationClauseBuilder().queryParameters(parameters).build();

    return
        Flux.from(
            databaseConfig
                .getDatabase()
                .select(query)
                .get(rs ->
                    new AdministrativeUnitBuilder()
                        .id(rs.getLong("id"))
                        .data(rs.getString("data"))
                        .version(rs.getInt("version"))
                        .build()));
  }

}

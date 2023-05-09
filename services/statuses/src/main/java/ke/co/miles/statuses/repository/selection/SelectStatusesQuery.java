/*
 * Copyright (C) 2021 Second Mile
 *
 * This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0.
 * If a copy of the MPL was not distributed with this file,
 * You can obtain one at http://mozilla.org/MPL/2.0/.
 */
package ke.co.miles.statuses.repository.selection;

import ke.co.miles.statuses.configurations.DatabaseConfig;
import ke.co.miles.statuses.models.Status;
import ke.co.miles.statuses.util.builders.StatusBuilder;
import ke.co.miles.statuses.util.builders.QueryPaginationClauseBuilder;
import ke.co.miles.statuses.util.builders.QueryWhereClauseBuilder;
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
public class SelectStatusesQuery {

    @Autowired
    DatabaseConfig databaseConfig;

    /**
     * Selects all or specific statuses records from the database depending on whether
     * query parameters were supplied as part of the query
     *
     * @param database   the name of the database from which the status records should be selected
     * @param parameters the query parameters passed along with the request
     * @return a list of statuses records if found
     */
    public Flux<Status> selectStatuses(String database, MultiValueMap<String, String> parameters) {

        log.trace("Entering selectStatuses()");

        String query =
                "SELECT * FROM status" +
                        new QueryWhereClauseBuilder().queryParameters(parameters).build() +
                        " ORDER BY id ASC" +
                        new QueryPaginationClauseBuilder().queryParameters(parameters).build();


        return
                Flux.from(
                        databaseConfig
                                .getDatabase(database)
                                .select(query)
                                .get(rs ->
                                        new StatusBuilder()
                                                .id(rs.getLong("id"))
                                                .data(rs.getString("data"))
                                                .version(rs.getInt("version"))
                                                .build()));
    }

}

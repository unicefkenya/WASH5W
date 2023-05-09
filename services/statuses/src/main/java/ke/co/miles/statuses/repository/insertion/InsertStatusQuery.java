/*
 * Copyright (C) 2021 Second Mile
 *
 * This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0.
 * If a copy of the MPL was not distributed with this file,
 * You can obtain one at http://mozilla.org/MPL/2.0/.
 */
package ke.co.miles.statuses.repository.insertion;

import ke.co.miles.statuses.configurations.DatabaseConfig;
import ke.co.miles.statuses.models.Status;
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
public class InsertStatusQuery {

    @Autowired
    DatabaseConfig databaseConfig;

    /**
     * Inserts a new status record into the database
     *
     * @param database the name of the database to which the status record insertion should be made
     * @param status a bean containing the status record details
     *
     * @return the unique identifier of the newly inserted status record
     */
    public Mono<Long> insertStatus(String database, Status status) {

        log.trace("Entering insertStatus()");

        String query = "INSERT INTO status(data) VALUES(?::jsonb)";

        return
                Mono.from(
                        databaseConfig
                                .getDatabase(database)
                                .update(query)
                                .parameters(
                                        status.getData())
                                .returnGeneratedKeys()
                                .getAs(Long.class));
    }

}

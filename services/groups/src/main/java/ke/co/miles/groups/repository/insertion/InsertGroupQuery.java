/*
 * Copyright (C) 2021 Second Mile
 *
 * This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0.
 * If a copy of the MPL was not distributed with this file,
 * You can obtain one at http://mozilla.org/MPL/2.0/.
 */
package ke.co.miles.groups.repository.insertion;

import ke.co.miles.groups.configurations.DatabaseConfig;
import ke.co.miles.groups.models.Group;
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
public class InsertGroupQuery {

    @Autowired
    DatabaseConfig databaseConfig;

    /**
     * Inserts a new group record into the database
     *
     * @param database the name of the database to which the group record insertion should be made
     * @param group a bean containing the group record details
     *
     * @return the unique identifier of the newly inserted group record
     */
    public Mono<Long> insertGroup(String database, Group group) {

        log.trace("Entering insertGroup()");

        String query = "INSERT INTO _group(data) VALUES(?::jsonb)";

        return
                Mono.from(
                        databaseConfig
                                .getDatabase(database)
                                .update(query)
                                .parameters(
                                        group.getData())
                                .returnGeneratedKeys()
                                .getAs(Long.class));
    }

}

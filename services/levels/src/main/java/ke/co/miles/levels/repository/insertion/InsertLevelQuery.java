/*
 * Copyright (C) 2021 Second Mile
 *
 * This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0.
 * If a copy of the MPL was not distributed with this file,
 * You can obtain one at http://mozilla.org/MPL/2.0/.
 */
package ke.co.miles.levels.repository.insertion;

import ke.co.miles.levels.configurations.DatabaseConfig;
import ke.co.miles.levels.models.Level;
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
public class InsertLevelQuery {

    @Autowired
    DatabaseConfig databaseConfig;

    /**
     * Inserts a new level record into the database
     *
     * @param database the name of the database to which the level record insertion should be made
     * @param level a bean containing the level record details
     *
     * @return the unique identifier of the newly inserted level record
     */
    public Mono<Long> insertLevel(String database, Level level) {

        log.trace("Entering insertLevel()");

        String query = "INSERT INTO level(data) VALUES(?::jsonb)";

        return
                Mono.from(
                        databaseConfig
                                .getDatabase(database)
                                .update(query)
                                .parameters(
                                        level.getData())
                                .returnGeneratedKeys()
                                .getAs(Long.class));
    }

}

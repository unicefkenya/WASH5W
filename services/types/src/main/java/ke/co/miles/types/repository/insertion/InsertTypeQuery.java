/*
 * Copyright (C) 2021 Second Mile
 *
 * This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0.
 * If a copy of the MPL was not distributed with this file,
 * You can obtain one at http://mozilla.org/MPL/2.0/.
 */
package ke.co.miles.types.repository.insertion;

import ke.co.miles.types.configurations.DatabaseConfig;
import ke.co.miles.types.models.Type;
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
public class InsertTypeQuery {

    @Autowired
    DatabaseConfig databaseConfig;

    /**
     * Inserts a new type record into the database
     *
     * @param database the name of the database to which the type record insertion should be made
     * @param type a bean containing the type record details
     *
     * @return the unique identifier of the newly inserted type record
     */
    public Mono<Long> insertType(String database, Type type) {

        log.trace("Entering insertType()");

        String query = "INSERT INTO type(data) VALUES(?::jsonb)";

        return
                Mono.from(
                        databaseConfig
                                .getDatabase(database)
                                .update(query)
                                .parameters(
                                        type.getData())
                                .returnGeneratedKeys()
                                .getAs(Long.class));
    }

}

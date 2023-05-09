/*
 * Copyright (C) 2021 Second Mile
 *
 * This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0.
 * If a copy of the MPL was not distributed with this file,
 * You can obtain one at http://mozilla.org/MPL/2.0/.
 */
package ke.co.miles.roles.repository.insertion;

import ke.co.miles.roles.configurations.DatabaseConfig;
import ke.co.miles.roles.models.Role;
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
public class InsertRoleQuery {

    @Autowired
    DatabaseConfig databaseConfig;

    /**
     * Inserts a new role record into the database
     *
     * @param database the name of the database to which the role record insertion should be made
     * @param role a bean containing the role record details
     *
     * @return the unique identifier of the newly inserted role record
     */
    public Mono<Long> insertRole(String database, Role role) {

        log.trace("Entering insertRole()");

        String query = "INSERT INTO _role(data) VALUES(?::jsonb)";

        return
                Mono.from(
                        databaseConfig
                                .getDatabase(database)
                                .update(query)
                                .parameters(
                                        role.getData())
                                .returnGeneratedKeys()
                                .getAs(Long.class));
    }

}

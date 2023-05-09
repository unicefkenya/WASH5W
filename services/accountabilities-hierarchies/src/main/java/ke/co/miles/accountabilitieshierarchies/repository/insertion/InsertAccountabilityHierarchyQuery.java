/*
 * Copyright (C) 2021 Second Mile
 *
 * This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0.
 * If a copy of the MPL was not distributed with this file,
 * You can obtain one at http://mozilla.org/MPL/2.0/.
 */
package ke.co.miles.accountabilitieshierarchies.repository.insertion;

import ke.co.miles.accountabilitieshierarchies.configurations.DatabaseConfig;
import ke.co.miles.accountabilitieshierarchies.models.AccountabilityHierarchy;
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
public class InsertAccountabilityHierarchyQuery {

    @Autowired
    DatabaseConfig databaseConfig;

    /**
     * Inserts a new accountability hierarchy record into the database
     *
     * @param database the name of the database to which the accountability hierarchy record insertion should be made
     * @param accountabilityHierarchy a bean containing the accountability hierarchy record details
     *
     * @return the unique identifier of the newly inserted accountability hierarchy record
     */
    public Mono<Long> insertAccountabilityHierarchy(String database, AccountabilityHierarchy accountabilityHierarchy) {

        log.trace("Entering insertAccountabilityHierarchy()");

        String query = "INSERT INTO accountability_hierarchy(data) VALUES(?::jsonb)";

        return
                Mono.from(
                        databaseConfig
                                .getDatabase(database)
                                .update(query)
                                .parameters(
                                        accountabilityHierarchy.getData())
                                .returnGeneratedKeys()
                                .getAs(Long.class));
    }

}

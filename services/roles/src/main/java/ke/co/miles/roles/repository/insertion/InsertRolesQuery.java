/*
 * Copyright (C) 2021 Second Mile
 *
 * This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0.
 * If a copy of the MPL was not distributed with this file,
 * You can obtain one at http://mozilla.org/MPL/2.0/.
 */
package ke.co.miles.roles.repository.insertion;

import io.reactivex.Flowable;
import ke.co.miles.roles.configurations.DatabaseConfig;
import ke.co.miles.roles.models.Role;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;
import reactor.core.publisher.Flux;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

/**
 * @author Kwaje Anthony <tony@miles.co.ke>
 * @version 1.0
 * @since 1.0
 */
@Component
@Slf4j
public class InsertRolesQuery {

    @Autowired
    DatabaseConfig databaseConfig;

    /**
     * Inserts new roles record into the database
     *
     * @param database the name of the database to which the role records insertion should be made
     * @param roles an array of beans containing the roles records details
     *
     * @return the unique identifiers of the newly inserted roles records
     */
    public Flux<Long> insertRoles(String database, Role[] roles) {

        log.trace("Entering insertRoles");

        String query = "INSERT INTO _role(data) VALUES(?::jsonb)";

        return
                Flux.from(
                        databaseConfig
                                .getDatabase(database)
                                .update(query)
                                .parameterListStream(getParametersListStream(roles))
                                .returnGeneratedKeys()
                                .getAs(Long.class));
    }

    private Flowable getParametersListStream(Role[] roles) {

        List<List> temp = new ArrayList<>();

        for (Role role : roles) {
            temp.add(Arrays.asList(
                    role.getData()
            ));
        }

        return Flowable.fromIterable(temp);
    }

}

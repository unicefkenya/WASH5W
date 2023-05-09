/*
 * Copyright (C) 2021 Second Mile
 *
 * This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0.
 * If a copy of the MPL was not distributed with this file,
 * You can obtain one at http://mozilla.org/MPL/2.0/.
 */
package ke.co.miles.roles.repository.updation;

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
public class UpdateRolesQuery {

    @Autowired
    DatabaseConfig databaseConfig;

    /**
     * Recursively Updates roles records
     *
     * @param database the name of the database to which the role records update should be made
     * @param roles an array of beans containing the roles records details
     *
     * @return the number of roles records affected by each recursive query i.e. updated
     */
    public Flux<Integer> updateRoles(String database, Role[] roles) {

        log.trace("Entering updateRoles()");

        String query = "UPDATE _role SET data = ?::jsonb WHERE id = ?";

        return
                Flux.from(
                        databaseConfig
                                .getDatabase(database)
                                .update(query)
                                .parameterListStream(getParametersListStream(roles))
                                .counts());
    }

    private Flowable getParametersListStream(Role[] roles) {

        List<List> temp = new ArrayList<>();

        for (Role role : roles) {
            temp.add(Arrays.asList(
                    role.getData(),
                    role.getId()
            ));
        }

        return Flowable.fromIterable(temp);
    }


}

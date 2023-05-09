/*
 * Copyright (C) 2021 Second Mile
 *
 * This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0.
 * If a copy of the MPL was not distributed with this file,
 * You can obtain one at http://mozilla.org/MPL/2.0/.
 */
package ke.co.miles.groups.repository.insertion;

import io.reactivex.Flowable;
import ke.co.miles.groups.configurations.DatabaseConfig;
import ke.co.miles.groups.models.Group;
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
public class InsertGroupsQuery {

    @Autowired
    DatabaseConfig databaseConfig;

    /**
     * Inserts new groups record into the database
     *
     * @param database the name of the database to which the group records insertion should be made
     * @param groups an array of beans containing the groups records details
     *
     * @return the unique identifiers of the newly inserted groups records
     */
    public Flux<Long> insertGroups(String database, Group[] groups) {

        log.trace("Entering insertGroups");

        String query = "INSERT INTO _group(data) VALUES(?::jsonb)";

        return
                Flux.from(
                        databaseConfig
                                .getDatabase(database)
                                .update(query)
                                .parameterListStream(getParametersListStream(groups))
                                .returnGeneratedKeys()
                                .getAs(Long.class));
    }

    private Flowable getParametersListStream(Group[] groups) {

        List<List> temp = new ArrayList<>();

        for (Group group : groups) {
            temp.add(Arrays.asList(
                    group.getData()
            ));
        }

        return Flowable.fromIterable(temp);
    }

}

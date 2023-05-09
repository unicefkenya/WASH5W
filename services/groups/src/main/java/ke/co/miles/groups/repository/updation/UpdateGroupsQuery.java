/*
 * Copyright (C) 2021 Second Mile
 *
 * This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0.
 * If a copy of the MPL was not distributed with this file,
 * You can obtain one at http://mozilla.org/MPL/2.0/.
 */
package ke.co.miles.groups.repository.updation;

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
public class UpdateGroupsQuery {

    @Autowired
    DatabaseConfig databaseConfig;

    /**
     * Recursively Updates groups records
     *
     * @param database the name of the database to which the group records update should be made
     * @param groups an array of beans containing the groups records details
     *
     * @return the number of groups records affected by each recursive query i.e. updated
     */
    public Flux<Integer> updateGroups(String database, Group[] groups) {

        log.trace("Entering updateGroups()");

        String query = "UPDATE _group SET data = ?::jsonb WHERE id = ?";

        return
                Flux.from(
                        databaseConfig
                                .getDatabase(database)
                                .update(query)
                                .parameterListStream(getParametersListStream(groups))
                                .counts());
    }

    private Flowable getParametersListStream(Group[] groups) {

        List<List> temp = new ArrayList<>();

        for (Group group : groups) {
            temp.add(Arrays.asList(
                    group.getData(),
                    group.getId()
            ));
        }

        return Flowable.fromIterable(temp);
    }


}

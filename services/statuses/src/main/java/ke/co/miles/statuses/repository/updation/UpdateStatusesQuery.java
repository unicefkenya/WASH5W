/*
 * Copyright (C) 2021 Second Mile
 *
 * This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0.
 * If a copy of the MPL was not distributed with this file,
 * You can obtain one at http://mozilla.org/MPL/2.0/.
 */
package ke.co.miles.statuses.repository.updation;

import io.reactivex.Flowable;
import ke.co.miles.statuses.configurations.DatabaseConfig;
import ke.co.miles.statuses.models.Status;
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
public class UpdateStatusesQuery {

    @Autowired
    DatabaseConfig databaseConfig;

    /**
     * Recursively Updates statuses records
     *
     * @param database the name of the database to which the status records update should be made
     * @param statuses an array of beans containing the statuses records details
     *
     * @return the number of statuses records affected by each recursive query i.e. updated
     */
    public Flux<Integer> updateStatuses(String database, Status[] statuses) {

        log.trace("Entering updateStatuses()");

        String query = "UPDATE status SET data = ?::jsonb WHERE id = ?";

        return
                Flux.from(
                        databaseConfig
                                .getDatabase(database)
                                .update(query)
                                .parameterListStream(getParametersListStream(statuses))
                                .counts());
    }

    private Flowable getParametersListStream(Status[] statuses) {

        List<List> temp = new ArrayList<>();

        for (Status status : statuses) {
            temp.add(Arrays.asList(
                    status.getData(),
                    status.getId()
            ));
        }

        return Flowable.fromIterable(temp);
    }


}

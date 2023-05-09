/*
 * Copyright (C) 2021 Second Mile
 *
 * This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0.
 * If a copy of the MPL was not distributed with this file,
 * You can obtain one at http://mozilla.org/MPL/2.0/.
 */
package ke.co.miles.statuses.repository.insertion;

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
public class InsertStatusesQuery {

    @Autowired
    DatabaseConfig databaseConfig;

    /**
     * Inserts new statuses record into the database
     *
     * @param database the name of the database to which the status records insertion should be made
     * @param statuses an array of beans containing the statuses records details
     *
     * @return the unique identifiers of the newly inserted statuses records
     */
    public Flux<Long> insertStatuses(String database, Status[] statuses) {

        log.trace("Entering insertStatuses");

        String query = "INSERT INTO status(data) VALUES(?::jsonb)";

        return
                Flux.from(
                        databaseConfig
                                .getDatabase(database)
                                .update(query)
                                .parameterListStream(getParametersListStream(statuses))
                                .returnGeneratedKeys()
                                .getAs(Long.class));
    }

    private Flowable getParametersListStream(Status[] statuses) {

        List<List> temp = new ArrayList<>();

        for (Status status : statuses) {
            temp.add(Arrays.asList(
                    status.getData()
            ));
        }

        return Flowable.fromIterable(temp);
    }

}

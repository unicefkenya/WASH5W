/*
 * Copyright (C) 2021 Second Mile
 *
 * This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0.
 * If a copy of the MPL was not distributed with this file,
 * You can obtain one at http://mozilla.org/MPL/2.0/.
 */
package ke.co.miles.levels.repository.insertion;

import io.reactivex.Flowable;
import ke.co.miles.levels.configurations.DatabaseConfig;
import ke.co.miles.levels.models.Level;
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
public class InsertLevelsQuery {

    @Autowired
    DatabaseConfig databaseConfig;

    /**
     * Inserts new levels record into the database
     *
     * @param database the name of the database to which the level records insertion should be made
     * @param levels an array of beans containing the levels records details
     *
     * @return the unique identifiers of the newly inserted levels records
     */
    public Flux<Long> insertLevels(String database, Level[] levels) {

        log.trace("Entering insertLevels");

        String query = "INSERT INTO level(data) VALUES(?::jsonb)";

        return
                Flux.from(
                        databaseConfig
                                .getDatabase(database)
                                .update(query)
                                .parameterListStream(getParametersListStream(levels))
                                .returnGeneratedKeys()
                                .getAs(Long.class));
    }

    private Flowable getParametersListStream(Level[] levels) {

        List<List> temp = new ArrayList<>();

        for (Level level : levels) {
            temp.add(Arrays.asList(
                    level.getData()
            ));
        }

        return Flowable.fromIterable(temp);
    }

}

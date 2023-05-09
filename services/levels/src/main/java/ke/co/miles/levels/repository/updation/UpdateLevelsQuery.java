/*
 * Copyright (C) 2021 Second Mile
 *
 * This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0.
 * If a copy of the MPL was not distributed with this file,
 * You can obtain one at http://mozilla.org/MPL/2.0/.
 */
package ke.co.miles.levels.repository.updation;

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
public class UpdateLevelsQuery {

    @Autowired
    DatabaseConfig databaseConfig;

    /**
     * Recursively Updates levels records
     *
     * @param database the name of the database to which the level records update should be made
     * @param levels an array of beans containing the levels records details
     *
     * @return the number of levels records affected by each recursive query i.e. updated
     */
    public Flux<Integer> updateLevels(String database, Level[] levels) {

        log.trace("Entering updateLevels()");

        String query = "UPDATE level SET data = ?::jsonb WHERE id = ?";

        return
                Flux.from(
                        databaseConfig
                                .getDatabase(database)
                                .update(query)
                                .parameterListStream(getParametersListStream(levels))
                                .counts());
    }

    private Flowable getParametersListStream(Level[] levels) {

        List<List> temp = new ArrayList<>();

        for (Level level : levels) {
            temp.add(Arrays.asList(
                    level.getData(),
                    level.getId()
            ));
        }

        return Flowable.fromIterable(temp);
    }


}

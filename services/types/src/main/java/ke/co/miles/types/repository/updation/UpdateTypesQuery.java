/*
 * Copyright (C) 2021 Second Mile
 *
 * This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0.
 * If a copy of the MPL was not distributed with this file,
 * You can obtain one at http://mozilla.org/MPL/2.0/.
 */
package ke.co.miles.types.repository.updation;

import io.reactivex.Flowable;
import ke.co.miles.types.configurations.DatabaseConfig;
import ke.co.miles.types.models.Type;
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
public class UpdateTypesQuery {

    @Autowired
    DatabaseConfig databaseConfig;

    /**
     * Recursively Updates types records
     *
     * @param database the name of the database to which the type records update should be made
     * @param types an array of beans containing the types records details
     *
     * @return the number of types records affected by each recursive query i.e. updated
     */
    public Flux<Integer> updateTypes(String database, Type[] types) {

        log.trace("Entering updateTypes()");

        String query = "UPDATE type SET data = ?::jsonb WHERE id = ?";

        return
                Flux.from(
                        databaseConfig
                                .getDatabase(database)
                                .update(query)
                                .parameterListStream(getParametersListStream(types))
                                .counts());
    }

    private Flowable getParametersListStream(Type[] types) {

        List<List> temp = new ArrayList<>();

        for (Type type : types) {
            temp.add(Arrays.asList(
                    type.getData(),
                    type.getId()
            ));
        }

        return Flowable.fromIterable(temp);
    }


}

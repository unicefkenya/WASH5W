/*
 * Copyright (C) 2021 Second Mile
 *
 * This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0.
 * If a copy of the MPL was not distributed with this file,
 * You can obtain one at http://mozilla.org/MPL/2.0/.
 */
package ke.co.miles.types.repository.insertion;

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
public class InsertTypesQuery {

    @Autowired
    DatabaseConfig databaseConfig;

    /**
     * Inserts new types record into the database
     *
     * @param database the name of the database to which the type records insertion should be made
     * @param types an array of beans containing the types records details
     *
     * @return the unique identifiers of the newly inserted types records
     */
    public Flux<Long> insertTypes(String database, Type[] types) {

        log.trace("Entering insertTypes");

        String query = "INSERT INTO type(data) VALUES(?::jsonb)";

        return
                Flux.from(
                        databaseConfig
                                .getDatabase(database)
                                .update(query)
                                .parameterListStream(getParametersListStream(types))
                                .returnGeneratedKeys()
                                .getAs(Long.class));
    }

    private Flowable getParametersListStream(Type[] types) {

        List<List> temp = new ArrayList<>();

        for (Type type : types) {
            temp.add(Arrays.asList(
                    type.getData()
            ));
        }

        return Flowable.fromIterable(temp);
    }

}

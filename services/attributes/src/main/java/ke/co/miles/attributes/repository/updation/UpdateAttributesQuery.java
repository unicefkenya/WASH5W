/*
 * Copyright (C) 2021 Second Mile
 *
 * This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0.
 * If a copy of the MPL was not distributed with this file,
 * You can obtain one at http://mozilla.org/MPL/2.0/.
 */
package ke.co.miles.attributes.repository.updation;

import io.reactivex.Flowable;
import ke.co.miles.attributes.configurations.DatabaseConfig;
import ke.co.miles.attributes.models.Attribute;
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
public class UpdateAttributesQuery {

    @Autowired
    DatabaseConfig databaseConfig;

    /**
     * Recursively Updates attributes records
     *
     * @param database the name of the database to which the attribute records update should be made
     * @param attributes an array of beans containing the attributes records details
     *
     * @return the number of attributes records affected by each recursive query i.e. updated
     */
    public Flux<Integer> updateAttributes(String database, Attribute[] attributes) {

        log.trace("Entering updateAttributes()");

        String query = "UPDATE attribute SET data = ?::jsonb WHERE id = ?";

        return
                Flux.from(
                        databaseConfig
                                .getDatabase(database)
                                .update(query)
                                .parameterListStream(getParametersListStream(attributes))
                                .counts());
    }

    private Flowable getParametersListStream(Attribute[] attributes) {

        List<List> temp = new ArrayList<>();

        for (Attribute attribute : attributes) {
            temp.add(Arrays.asList(
                    attribute.getData(),
                    attribute.getId()
            ));
        }

        return Flowable.fromIterable(temp);
    }


}

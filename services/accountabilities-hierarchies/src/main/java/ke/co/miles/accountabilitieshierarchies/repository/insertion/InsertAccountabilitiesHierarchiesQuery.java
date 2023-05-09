/*
 * Copyright (C) 2021 Second Mile
 *
 * This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0.
 * If a copy of the MPL was not distributed with this file,
 * You can obtain one at http://mozilla.org/MPL/2.0/.
 */
package ke.co.miles.accountabilitieshierarchies.repository.insertion;

import io.reactivex.Flowable;
import ke.co.miles.accountabilitieshierarchies.configurations.DatabaseConfig;
import ke.co.miles.accountabilitieshierarchies.models.AccountabilityHierarchy;
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
public class InsertAccountabilitiesHierarchiesQuery {

    @Autowired
    DatabaseConfig databaseConfig;

    /**
     * Inserts new accountabilitiesHierarchies record into the database
     *
     * @param database the name of the database to which the accountabilities hierarchies records insertion should be made
     * @param accountabilitiesHierarchies an array of beans containing the accountabilities hierarchies records details
     *
     * @return the unique identifiers of the newly inserted accountabilities hierarchies records
     */
    public Flux<Long> insertAccountabilitiesHierarchies(String database, AccountabilityHierarchy[] accountabilitiesHierarchies) {

        log.trace("Entering insertAccountabilitiesHierarchies");

        String query = "INSERT INTO accountability_hierarchy(data) VALUES(?::jsonb)";

        return
                Flux.from(
                        databaseConfig
                                .getDatabase(database)
                                .update(query)
                                .parameterListStream(getParametersListStream(accountabilitiesHierarchies))
                                .returnGeneratedKeys()
                                .getAs(Long.class));
    }

    private Flowable getParametersListStream(AccountabilityHierarchy[] accountabilitiesHierarchies) {

        List<List> temp = new ArrayList<>();

        for (AccountabilityHierarchy accountabilityHierarchy : accountabilitiesHierarchies) {
            temp.add(Arrays.asList(
                    accountabilityHierarchy.getData()
            ));
        }

        return Flowable.fromIterable(temp);
    }

}

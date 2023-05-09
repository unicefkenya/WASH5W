/*
 * Copyright (C) 2021 Second Mile
 *
 * This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0.
 * If a copy of the MPL was not distributed with this file,
 * You can obtain one at http://mozilla.org/MPL/2.0/.
 */
package ke.co.miles.accountabilitieshierarchies.repository.updation;

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
public class UpdateAccountabilitiesHierarchiesQuery {

    @Autowired
    DatabaseConfig databaseConfig;

    /**
     * Recursively Updates accountabilities hierarchies records
     *
     * @param database the name of the database to which the accountabilities hierarchies records update should be made
     * @param accountabilitiesHierarchies an array of beans containing the accountabilities hierarchies records details
     *
     * @return the number of accountabilities hierarchies records affected by each recursive query i.e. updated
     */
    public Flux<Integer> updateAccountabilitiesHierarchies(String database, AccountabilityHierarchy[] accountabilitiesHierarchies) {

        log.trace("Entering updateAccountabilitiesHierarchies()");

        String query = "UPDATE accountability_hierarchy SET data = ?::jsonb WHERE id = ?";

        return
                Flux.from(
                        databaseConfig
                                .getDatabase(database)
                                .update(query)
                                .parameterListStream(getParametersListStream(accountabilitiesHierarchies))
                                .counts());
    }

    private Flowable getParametersListStream(AccountabilityHierarchy[] accountabilitiesHierarchies) {

        List<List> temp = new ArrayList<>();

        for (AccountabilityHierarchy accountabilityHierarchy : accountabilitiesHierarchies) {
            temp.add(Arrays.asList(
                    accountabilityHierarchy.getData(),
                    accountabilityHierarchy.getId()
            ));
        }

        return Flowable.fromIterable(temp);
    }


}

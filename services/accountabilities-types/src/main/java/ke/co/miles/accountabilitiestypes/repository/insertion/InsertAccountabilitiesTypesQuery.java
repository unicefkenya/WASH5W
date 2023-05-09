/*
 * Copyright (C) 2021 Second Mile
 *
 * This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0.
 * If a copy of the MPL was not distributed with this file,
 * You can obtain one at http://mozilla.org/MPL/2.0/.
 */
package ke.co.miles.accountabilitiestypes.repository.insertion;

import io.reactivex.Flowable;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import ke.co.miles.accountabilitiestypes.configurations.DatabaseConfig;
import ke.co.miles.accountabilitiestypes.models.AccountabilityType;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;
import reactor.core.publisher.Flux;

/**
 * @author Kwaje Anthony <tony@miles.co.ke>
 * @version 1.0
 * @since 1.0
 */
@Component
@Slf4j
public class InsertAccountabilitiesTypesQuery {

  @Autowired
  DatabaseConfig databaseConfig;

  /**
   * Inserts new accountabilitiesTypes record into the database
   *
   * @param database              the name of the database within which the accountabilities types
   *                              records insertion should be made
   * @param accountabilitiesTypes an array of beans containing the accountabilities types records
   *                              details
   * @return the unique identifiers of the newly inserted accountabilities types records
   */
  public Flux<Long> insertAccountabilitiesTypes(String database,
      AccountabilityType[] accountabilitiesTypes) {

    log.trace("Entering insertAccountabilitiesTypes");

    String query = "INSERT INTO accountability_type(data) VALUES(?::jsonb)";

    return
        Flux.from(
            databaseConfig
                .getDatabase(database)
                .update(query)
                .parameterListStream(getParametersListStream(accountabilitiesTypes))
                .returnGeneratedKeys()
                .getAs(Long.class));
  }

  private Flowable getParametersListStream(AccountabilityType[] accountabilitiesTypes) {

    List<List> temp = new ArrayList<>();

    for (AccountabilityType accountabilityType : accountabilitiesTypes) {
      temp.add(Arrays.asList(accountabilityType.getData()));
    }

    return Flowable.fromIterable(temp);
  }

}

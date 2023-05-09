/*
 * Copyright (C) 2021 Second Mile
 *
 * This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0.
 * If a copy of the MPL was not distributed with this file,
 * You can obtain one at http://mozilla.org/MPL/2.0/.
 */
package ke.co.miles.accountabilities.repository.updation;

import io.reactivex.Flowable;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import ke.co.miles.accountabilities.configurations.DatabaseConfig;
import ke.co.miles.accountabilities.models.Accountability;
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
public class UpdateAccountabilitiesQuery {

  @Autowired
  DatabaseConfig databaseConfig;

  /**
   * Recursively Updates accountabilities records
   *
   * @param database              the name of the database within which the accountabilities
   *                              records update should be made
   * @param accountabilities an array of beans containing the accountabilities records
   *                              details
   * @return the number of accountabilities records affected by each recursive query i.e.
   * updated
   */
  public Flux<Integer> updateAccountabilities(String database,
      Accountability[] accountabilities) {

    log.trace("Entering updateAccountabilities()");

    String query = "UPDATE accountability SET data = ?::jsonb WHERE id = ?";

    return
        Flux.from(
            databaseConfig
                .getDatabase(database)
                .update(query)
                .parameterListStream(getParametersListStream(accountabilities))
                .counts());
  }

  private Flowable getParametersListStream(Accountability[] accountabilities) {

    List<List> temp = new ArrayList<>();

    for (Accountability accountability : accountabilities) {
      temp.add(Arrays.asList(
          accountability.getData(),
          accountability.getId()
      ));
    }

    return Flowable.fromIterable(temp);
  }


}

/*
 * Copyright (C) 2021 Second Mile
 *
 * This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0.
 * If a copy of the MPL was not distributed with this file,
 * You can obtain one at http://mozilla.org/MPL/2.0/.
 */
package ke.co.miles.accountabilities.repository.insertion;

import ke.co.miles.accountabilities.configurations.DatabaseConfig;
import ke.co.miles.accountabilities.models.Accountability;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;
import reactor.core.publisher.Mono;

/**
 * @author Kwaje Anthony <tony@miles.co.ke>
 * @version 1.0
 * @since 1.0
 */
@Component
@Slf4j
public class InsertAccountabilityQuery {

  @Autowired
  DatabaseConfig databaseConfig;

  /**
   * Inserts a new accountability record into the database
   *
   * @param database           the name of the database within which the accountability record
   *                           insertion should be made
   * @param accountability a bean containing the accountability record details
   * @return the unique identifier of the newly inserted accountability record
   */
  public Mono<Long> insertAccountability(String database,
      Accountability accountability) {

    log.trace("Entering insertAccountability()");

    String query = "INSERT INTO accountability(data) VALUES(?::jsonb)";

    return
        Mono.from(
            databaseConfig
                .getDatabase(database)
                .update(query)
                .parameters(accountability.getData())
                .returnGeneratedKeys()
                .getAs(Long.class));
  }

}

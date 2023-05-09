/*
 * Copyright (C) 2021 Second Mile
 *
 * This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0.
 * If a copy of the MPL was not distributed with this file,
 * You can obtain one at http://mozilla.org/MPL/2.0/.
 */
package ke.co.miles.accountabilities.repository.updation;

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
public class UpdateAccountabilityQuery {

  @Autowired
  DatabaseConfig databaseConfig;

  /**
   * Updates an accountability record
   *
   * @param database           the name of the database within which the accountability record
   *                           update should be made
   * @param accountability a bean containing the accountability record details
   * @return the number of accountabilities records affected by the query i.e. updated
   */
  public Mono<Integer> updateAccountability(String database,
      Accountability accountability) {

    log.trace("Entering updateAccountability()");

    String query = "UPDATE accountability SET data = ?::jsonb WHERE id = ?";

    return
        Mono.from(
            databaseConfig
                .getDatabase(database)
                .update(query)
                .parameters(
                    accountability.getData(),
                    accountability.getId())
                .counts());
  }
}

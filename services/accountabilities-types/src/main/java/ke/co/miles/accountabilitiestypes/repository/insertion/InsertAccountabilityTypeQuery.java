/*
 * Copyright (C) 2021 Second Mile
 *
 * This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0.
 * If a copy of the MPL was not distributed with this file,
 * You can obtain one at http://mozilla.org/MPL/2.0/.
 */
package ke.co.miles.accountabilitiestypes.repository.insertion;

import ke.co.miles.accountabilitiestypes.configurations.DatabaseConfig;
import ke.co.miles.accountabilitiestypes.models.AccountabilityType;
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
public class InsertAccountabilityTypeQuery {

  @Autowired
  DatabaseConfig databaseConfig;

  /**
   * Inserts a new accountability type record into the database
   *
   * @param database           the name of the database within which the accountability type record
   *                           insertion should be made
   * @param accountabilityType a bean containing the accountability type record details
   * @return the unique identifier of the newly inserted accountability type record
   */
  public Mono<Long> insertAccountabilityType(String database,
      AccountabilityType accountabilityType) {

    log.trace("Entering insertAccountabilityType()");

    String query = "INSERT INTO accountability_type(data) VALUES(?::jsonb)";

    return
        Mono.from(
            databaseConfig
                .getDatabase(database)
                .update(query)
                .parameters(accountabilityType.getData())
                .returnGeneratedKeys()
                .getAs(Long.class));
  }

}

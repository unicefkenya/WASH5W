/*
 * Copyright (C) 2021 Second Mile
 *
 * This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0.
 * If a copy of the MPL was not distributed with this file,
 * You can obtain one at http://mozilla.org/MPL/2.0/.
 */
package ke.co.miles.dissagregations.repository.insertion;

import ke.co.miles.dissagregations.configurations.DatabaseConfig;
import ke.co.miles.dissagregations.models.Dissagregation;
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
public class InsertDissagregationQuery {

  @Autowired
  DatabaseConfig databaseConfig;

  /**
   * Inserts a new dissagregation record into the database
   *
   * @param dissagregation   a bean containing the dissagregation record details
   * @return the unique identifier of the newly inserted dissagregation record
   */
  public Mono<Long> insertDissagregation(Dissagregation dissagregation) {

    log.trace("Entering insertDissagregation()");

    String query = "INSERT INTO dissagregation(data) VALUES(?::jsonb)";

    return
        Mono.from(
            databaseConfig
                .getDatabase()
                .update(query)
                .parameters(
                    dissagregation.getData())
                .returnGeneratedKeys()
                .getAs(Long.class));
  }

}

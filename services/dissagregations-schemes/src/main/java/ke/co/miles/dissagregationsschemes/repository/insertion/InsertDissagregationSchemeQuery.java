/*
 * Copyright (C) 2021 Second Mile
 *
 * This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0.
 * If a copy of the MPL was not distributed with this file,
 * You can obtain one at http://mozilla.org/MPL/2.0/.
 */
package ke.co.miles.dissagregationsschemes.repository.insertion;

import ke.co.miles.dissagregationsschemes.configurations.DatabaseConfig;
import ke.co.miles.dissagregationsschemes.models.DissagregationScheme;
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
public class InsertDissagregationSchemeQuery {

  @Autowired
  DatabaseConfig databaseConfig;

  /**
   * Inserts a new dissagregationScheme record into the database
   *
   * @param dissagregationScheme   a bean containing the dissagregationScheme record details
   * @return the unique identifier of the newly inserted dissagregationScheme record
   */
  public Mono<Long> insertDissagregationScheme(DissagregationScheme dissagregationScheme) {

    log.trace("Entering insertDissagregationScheme()");

    String query = "INSERT INTO dissagregation_scheme(data) VALUES(?::jsonb)";

    return
        Mono.from(
            databaseConfig
                .getDatabase()
                .update(query)
                .parameters(
                    dissagregationScheme.getData())
                .returnGeneratedKeys()
                .getAs(Long.class));
  }

}

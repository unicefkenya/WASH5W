/*
 * Copyright (C) 2021 Second Mile
 *
 * This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0.
 * If a copy of the MPL was not distributed with this file,
 * You can obtain one at http://mozilla.org/MPL/2.0/.
 */
package ke.co.miles.indicators.repository.insertion;

import ke.co.miles.indicators.configurations.DatabaseConfig;
import ke.co.miles.indicators.models.Indicator;
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
public class InsertIndicatorQuery {

  @Autowired
  DatabaseConfig databaseConfig;

  /**
   * Inserts a new indicator record into the database
   *
   * @param indicator   a bean containing the indicator record details
   * @return the unique identifier of the newly inserted indicator record
   */
  public Mono<Long> insertIndicator(Indicator indicator) {

    log.trace("Entering insertIndicator()");

    String query = "INSERT INTO indicator(data) VALUES(?::jsonb)";

    return
        Mono.from(
            databaseConfig
                .getDatabase()
                .update(query)
                .parameters(
                    indicator.getData())
                .returnGeneratedKeys()
                .getAs(Long.class));
  }

}

/*
 * Copyright (C) 2021 Second Mile
 *
 * This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0.
 * If a copy of the MPL was not distributed with this file,
 * You can obtain one at http://mozilla.org/MPL/2.0/.
 */
package ke.co.miles.options.repository.insertion;

import ke.co.miles.options.configurations.DatabaseConfig;
import ke.co.miles.options.models.Option;
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
public class InsertOptionQuery {

  @Autowired
  DatabaseConfig databaseConfig;

  /**
   * Inserts a new option record into the database
   *
   * @param option   a bean containing the option record details
   * @return the unique identifier of the newly inserted option record
   */
  public Mono<Long> insertOption(Option option) {

    log.trace("Entering insertOption()");

    String query = "INSERT INTO option(data) VALUES(?::jsonb)";

    return
        Mono.from(
            databaseConfig
                .getDatabase()
                .update(query)
                .parameters(
                    option.getData())
                .returnGeneratedKeys()
                .getAs(Long.class));
  }

}

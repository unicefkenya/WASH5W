/*
 * Copyright (C) 2021 Second Mile
 *
 * This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0.
 * If a copy of the MPL was not distributed with this file,
 * You can obtain one at http://mozilla.org/MPL/2.0/.
 */
package ke.co.miles.optionstypes.repository.insertion;

import ke.co.miles.optionstypes.configurations.DatabaseConfig;
import ke.co.miles.optionstypes.models.OptionType;
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
public class InsertOptionTypeQuery {

  @Autowired
  DatabaseConfig databaseConfig;

  /**
   * Inserts a new optionType record into the database
   *
   * @param optionType   a bean containing the optionType record details
   * @return the unique identifier of the newly inserted optionType record
   */
  public Mono<Long> insertOptionType(OptionType optionType) {

    log.trace("Entering insertOptionType()");

    String query = "INSERT INTO option_type(data) VALUES(?::jsonb)";

    return
        Mono.from(
            databaseConfig
                .getDatabase()
                .update(query)
                .parameters(
                    optionType.getData())
                .returnGeneratedKeys()
                .getAs(Long.class));
  }

}

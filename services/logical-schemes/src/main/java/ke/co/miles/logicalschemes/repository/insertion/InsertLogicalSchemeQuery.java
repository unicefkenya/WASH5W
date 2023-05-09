/*
 * Copyright (C) 2021 Second Mile
 *
 * This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0.
 * If a copy of the MPL was not distributed with this file,
 * You can obtain one at http://mozilla.org/MPL/2.0/.
 */
package ke.co.miles.logicalschemes.repository.insertion;

import ke.co.miles.logicalschemes.configurations.DatabaseConfig;
import ke.co.miles.logicalschemes.models.LogicalScheme;
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
public class InsertLogicalSchemeQuery {

  @Autowired
  DatabaseConfig databaseConfig;

  /**
   * Inserts a new logicalScheme record into the database
   *
   * @param logicalScheme   a bean containing the logicalScheme record details
   * @return the unique identifier of the newly inserted logicalScheme record
   */
  public Mono<Long> insertLogicalScheme(LogicalScheme logicalScheme) {

    log.trace("Entering insertLogicalScheme()");

    String query = "INSERT INTO logical_scheme(data) VALUES(?::jsonb)";

    return
        Mono.from(
            databaseConfig
                .getDatabase()
                .update(query)
                .parameters(
                    logicalScheme.getData())
                .returnGeneratedKeys()
                .getAs(Long.class));
  }

}

/*
 * Copyright (C) 2021 Second Mile
 *
 * This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0.
 * If a copy of the MPL was not distributed with this file,
 * You can obtain one at http://mozilla.org/MPL/2.0/.
 */
package ke.co.miles.contexts.repository.insertion;

import ke.co.miles.contexts.configurations.DatabaseConfig;
import ke.co.miles.contexts.models.Context;
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
public class InsertContextQuery {

  @Autowired
  DatabaseConfig databaseConfig;

  /**
   * Inserts a new context record into the database
   *
   * @param context   a bean containing the context record details
   * @return the unique identifier of the newly inserted context record
   */
  public Mono<Long> insertContext(Context context) {

    log.trace("Entering insertContext()");

    String query = "INSERT INTO context(data) VALUES(?::jsonb)";

    return
        Mono.from(
            databaseConfig
                .getDatabase()
                .update(query)
                .parameters(
                    context.getData())
                .returnGeneratedKeys()
                .getAs(Long.class));
  }

}

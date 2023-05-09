/*
 * Copyright (C) 2021 Second Mile
 *
 * This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0.
 * If a copy of the MPL was not distributed with this file,
 * You can obtain one at http://mozilla.org/MPL/2.0/.
 */
package ke.co.miles.contexts.repository.updation;

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
public class UpdateContextQuery {

  @Autowired
  DatabaseConfig databaseConfig;

  /**
   * Updates a context record
   *
   * @param context   a bean containing the context record details
   * @return the number of contexts records affected by the query i.e. updated
   */
  public Mono<Integer> updateContext(Context context) {

    log.trace("Entering updateContext()");

    String query = "UPDATE context SET data = ?::jsonb WHERE id = ?";

    return
        Mono.from(
            databaseConfig
                .getDatabase()
                .update(query)
                .parameters(
                    context.getData(),
                    context.getId())
                .counts());
  }
}

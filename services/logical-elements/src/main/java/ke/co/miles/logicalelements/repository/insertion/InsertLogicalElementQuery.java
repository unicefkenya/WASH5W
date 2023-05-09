/*
 * Copyright (C) 2021 Second Mile
 *
 * This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0.
 * If a copy of the MPL was not distributed with this file,
 * You can obtain one at http://mozilla.org/MPL/2.0/.
 */
package ke.co.miles.logicalelements.repository.insertion;

import ke.co.miles.logicalelements.configurations.DatabaseConfig;
import ke.co.miles.logicalelements.models.LogicalElement;
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
public class InsertLogicalElementQuery {

  @Autowired
  DatabaseConfig databaseConfig;

  /**
   * Inserts a new logicalElement record into the database
   *
   * @param logicalElement   a bean containing the logicalElement record details
   * @return the unique identifier of the newly inserted logicalElement record
   */
  public Mono<Long> insertLogicalElement(LogicalElement logicalElement) {

    log.trace("Entering insertLogicalElement()");

    String query = "INSERT INTO logical_element(data) VALUES(?::jsonb)";

    return
        Mono.from(
            databaseConfig
                .getDatabase()
                .update(query)
                .parameters(
                    logicalElement.getData())
                .returnGeneratedKeys()
                .getAs(Long.class));
  }

}

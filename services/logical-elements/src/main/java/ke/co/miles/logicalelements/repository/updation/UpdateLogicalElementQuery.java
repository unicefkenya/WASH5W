/*
 * Copyright (C) 2021 Second Mile
 *
 * This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0.
 * If a copy of the MPL was not distributed with this file,
 * You can obtain one at http://mozilla.org/MPL/2.0/.
 */
package ke.co.miles.logicalelements.repository.updation;

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
public class UpdateLogicalElementQuery {

  @Autowired
  DatabaseConfig databaseConfig;

  /**
   * Updates a logicalElement record
   *
   * @param logicalElement   a bean containing the logicalElement record details
   * @return the number of logicalElements records affected by the query i.e. updated
   */
  public Mono<Integer> updateLogicalElement(LogicalElement logicalElement) {

    log.trace("Entering updateLogicalElement()");

    String query = "UPDATE logical_element SET data = ?::jsonb WHERE id = ?";

    return
        Mono.from(
            databaseConfig
                .getDatabase()
                .update(query)
                .parameters(
                    logicalElement.getData(),
                    logicalElement.getId())
                .counts());
  }
}

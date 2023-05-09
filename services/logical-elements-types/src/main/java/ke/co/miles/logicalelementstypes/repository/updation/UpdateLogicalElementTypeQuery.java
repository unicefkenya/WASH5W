/*
 * Copyright (C) 2021 Second Mile
 *
 * This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0.
 * If a copy of the MPL was not distributed with this file,
 * You can obtain one at http://mozilla.org/MPL/2.0/.
 */
package ke.co.miles.logicalelementstypes.repository.updation;

import ke.co.miles.logicalelementstypes.configurations.DatabaseConfig;
import ke.co.miles.logicalelementstypes.models.LogicalElementType;
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
public class UpdateLogicalElementTypeQuery {

  @Autowired
  DatabaseConfig databaseConfig;

  /**
   * Updates a logicalElementType record
   *
   * @param logicalElementType   a bean containing the logicalElementType record details
   * @return the number of logicalElementsTypes records affected by the query i.e. updated
   */
  public Mono<Integer> updateLogicalElementType(LogicalElementType logicalElementType) {

    log.trace("Entering updateLogicalElementType()");

    String query = "UPDATE logical_element_type SET data = ?::jsonb WHERE id = ?";

    return
        Mono.from(
            databaseConfig
                .getDatabase()
                .update(query)
                .parameters(
                    logicalElementType.getData(),
                    logicalElementType.getId())
                .counts());
  }
}

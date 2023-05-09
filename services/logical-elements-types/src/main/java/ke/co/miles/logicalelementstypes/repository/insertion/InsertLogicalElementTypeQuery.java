/*
 * Copyright (C) 2021 Second Mile
 *
 * This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0.
 * If a copy of the MPL was not distributed with this file,
 * You can obtain one at http://mozilla.org/MPL/2.0/.
 */
package ke.co.miles.logicalelementstypes.repository.insertion;

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
public class InsertLogicalElementTypeQuery {

  @Autowired
  DatabaseConfig databaseConfig;

  /**
   * Inserts a new logicalElementType record into the database
   *
   * @param logicalElementType   a bean containing the logicalElementType record details
   * @return the unique identifier of the newly inserted logicalElementType record
   */
  public Mono<Long> insertLogicalElementType(LogicalElementType logicalElementType) {

    log.trace("Entering insertLogicalElementType()");

    String query = "INSERT INTO logical_element_type(data) VALUES(?::jsonb)";

    return
        Mono.from(
            databaseConfig
                .getDatabase()
                .update(query)
                .parameters(
                    logicalElementType.getData())
                .returnGeneratedKeys()
                .getAs(Long.class));
  }

}

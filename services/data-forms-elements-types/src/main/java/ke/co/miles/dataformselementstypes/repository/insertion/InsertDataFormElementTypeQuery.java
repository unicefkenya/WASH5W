/*
 * Copyright (C) 2021 Second Mile
 *
 * This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0.
 * If a copy of the MPL was not distributed with this file,
 * You can obtain one at http://mozilla.org/MPL/2.0/.
 */
package ke.co.miles.dataformselementstypes.repository.insertion;

import ke.co.miles.dataformselementstypes.configurations.DatabaseConfig;
import ke.co.miles.dataformselementstypes.models.DataFormElementType;
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
public class InsertDataFormElementTypeQuery {

  @Autowired
  DatabaseConfig databaseConfig;

  /**
   * Inserts a new dataFormElementType record into the database
   *
   * @param dataFormElementType   a bean containing the dataFormElementType record details
   * @return the unique identifier of the newly inserted dataFormElementType record
   */
  public Mono<Long> insertDataFormElementType(DataFormElementType dataFormElementType) {

    log.trace("Entering insertDataFormElementType()");

    String query = "INSERT INTO data_form_element_type(data) VALUES(?::jsonb)";

    return
        Mono.from(
            databaseConfig
                .getDatabase()
                .update(query)
                .parameters(
                    dataFormElementType.getData())
                .returnGeneratedKeys()
                .getAs(Long.class));
  }

}

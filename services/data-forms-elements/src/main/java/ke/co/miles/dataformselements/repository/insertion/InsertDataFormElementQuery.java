/*
 * Copyright (C) 2021 Second Mile
 *
 * This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0.
 * If a copy of the MPL was not distributed with this file,
 * You can obtain one at http://mozilla.org/MPL/2.0/.
 */
package ke.co.miles.dataformselements.repository.insertion;

import ke.co.miles.dataformselements.configurations.DatabaseConfig;
import ke.co.miles.dataformselements.models.DataFormElement;
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
public class InsertDataFormElementQuery {

  @Autowired
  DatabaseConfig databaseConfig;

  /**
   * Inserts a new dataFormElement record into the database
   *
   * @param dataFormElement   a bean containing the dataFormElement record details
   * @return the unique identifier of the newly inserted dataFormElement record
   */
  public Mono<Long> insertDataFormElement(DataFormElement dataFormElement) {

    log.trace("Entering insertDataFormElement()");

    String query = "INSERT INTO data_form_element_(data) VALUES(?::jsonb)";

    return
        Mono.from(
            databaseConfig
                .getDatabase()
                .update(query)
                .parameters(
                    dataFormElement.getData())
                .returnGeneratedKeys()
                .getAs(Long.class));
  }

}

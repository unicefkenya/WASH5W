/*
 * Copyright (C) 2021 Second Mile
 *
 * This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0.
 * If a copy of the MPL was not distributed with this file,
 * You can obtain one at http://mozilla.org/MPL/2.0/.
 */
package ke.co.miles.dataforms.repository.insertion;

import ke.co.miles.dataforms.configurations.DatabaseConfig;
import ke.co.miles.dataforms.models.DataForm;
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
public class InsertDataFormQuery {

  @Autowired
  DatabaseConfig databaseConfig;

  /**
   * Inserts a new dataForm record into the database
   *
   * @param dataForm   a bean containing the dataForm record details
   * @return the unique identifier of the newly inserted dataForm record
   */
  public Mono<Long> insertDataForm(DataForm dataForm) {

    log.trace("Entering insertDataForm()");

    String query = "INSERT INTO data_form(data) VALUES(?::jsonb)";

    return
        Mono.from(
            databaseConfig
                .getDatabase()
                .update(query)
                .parameters(
                    dataForm.getData())
                .returnGeneratedKeys()
                .getAs(Long.class));
  }

}

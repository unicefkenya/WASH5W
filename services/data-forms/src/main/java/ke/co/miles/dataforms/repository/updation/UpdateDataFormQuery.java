/*
 * Copyright (C) 2021 Second Mile
 *
 * This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0.
 * If a copy of the MPL was not distributed with this file,
 * You can obtain one at http://mozilla.org/MPL/2.0/.
 */
package ke.co.miles.dataforms.repository.updation;

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
public class UpdateDataFormQuery {

  @Autowired
  DatabaseConfig databaseConfig;

  /**
   * Updates a dataForm record
   *
   * @param dataForm   a bean containing the dataForm record details
   * @return the number of dataForms records affected by the query i.e. updated
   */
  public Mono<Integer> updateDataForm(DataForm dataForm) {

    log.trace("Entering updateDataForm()");

    String query = "UPDATE data_form SET data = ?::jsonb WHERE id = ?";

    return
        Mono.from(
            databaseConfig
                .getDatabase()
                .update(query)
                .parameters(
                    dataForm.getData(),
                    dataForm.getId())
                .counts());
  }
}

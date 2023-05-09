/*
 * Copyright (C) 2021 Second Mile
 *
 * This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0.
 * If a copy of the MPL was not distributed with this file,
 * You can obtain one at http://mozilla.org/MPL/2.0/.
 */
package ke.co.miles.dataformselements.repository.deletion;

import ke.co.miles.dataformselements.configurations.DatabaseConfig;
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
public class DeleteDataFormElementQuery {

  @Autowired
  DatabaseConfig databaseConfig;

  /**
   * Deletes a dataFormElement record from the database
   *
   * @param id the unique identifier of the dataFormElement record to be deleted
   * @return the number of dataFormsElements records affected by the query i.e. deleted
   */
  public Mono<Integer> deleteDataFormElement(Long id) {

    log.trace("Entering deleteDataFormElement");

    String query = "DELETE FROM data_form_element_ WHERE id = ?";

    return
        Mono.from(
            databaseConfig
                .getDatabase()
                .update(query)
                .parameters(id)
                .counts());
  }

}

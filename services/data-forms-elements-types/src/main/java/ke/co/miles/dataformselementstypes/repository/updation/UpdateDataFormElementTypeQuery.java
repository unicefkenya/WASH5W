/*
 * Copyright (C) 2021 Second Mile
 *
 * This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0.
 * If a copy of the MPL was not distributed with this file,
 * You can obtain one at http://mozilla.org/MPL/2.0/.
 */
package ke.co.miles.dataformselementstypes.repository.updation;

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
public class UpdateDataFormElementTypeQuery {

  @Autowired
  DatabaseConfig databaseConfig;

  /**
   * Updates a dataFormElementType record
   *
   * @param dataFormElementType   a bean containing the dataFormElementType record details
   * @return the number of dataFormsElementsTypes records affected by the query i.e. updated
   */
  public Mono<Integer> updateDataFormElementType(DataFormElementType dataFormElementType) {

    log.trace("Entering updateDataFormElementType()");

    String query = "UPDATE data_form_element_type SET data = ?::jsonb WHERE id = ?";

    return
        Mono.from(
            databaseConfig
                .getDatabase()
                .update(query)
                .parameters(
                    dataFormElementType.getData(),
                    dataFormElementType.getId())
                .counts());
  }
}

/*
 * Copyright (C) 2021 Second Mile
 *
 * This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0.
 * If a copy of the MPL was not distributed with this file,
 * You can obtain one at http://mozilla.org/MPL/2.0/.
 */
package ke.co.miles.dataformselementscategories.repository.updation;

import ke.co.miles.dataformselementscategories.configurations.DatabaseConfig;
import ke.co.miles.dataformselementscategories.models.DataFormElementCategory;
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
public class UpdateDataFormElementCategoryQuery {

  @Autowired
  DatabaseConfig databaseConfig;

  /**
   * Updates a dataFormElementCategory record
   *
   * @param dataFormElementCategory   a bean containing the dataFormElementCategory record details
   * @return the number of dataFormsElementsCategories records affected by the query i.e. updated
   */
  public Mono<Integer> updateDataFormElementCategory(DataFormElementCategory dataFormElementCategory) {

    log.trace("Entering updateDataFormElementCategory()");

    String query = "UPDATE data_form_element_category SET data = ?::jsonb WHERE id = ?";

    return
        Mono.from(
            databaseConfig
                .getDatabase()
                .update(query)
                .parameters(
                    dataFormElementCategory.getData(),
                    dataFormElementCategory.getId())
                .counts());
  }
}

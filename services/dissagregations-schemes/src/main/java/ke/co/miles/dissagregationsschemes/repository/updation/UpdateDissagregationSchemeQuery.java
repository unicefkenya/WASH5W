/*
 * Copyright (C) 2021 Second Mile
 *
 * This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0.
 * If a copy of the MPL was not distributed with this file,
 * You can obtain one at http://mozilla.org/MPL/2.0/.
 */
package ke.co.miles.dissagregationsschemes.repository.updation;

import ke.co.miles.dissagregationsschemes.configurations.DatabaseConfig;
import ke.co.miles.dissagregationsschemes.models.DissagregationScheme;
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
public class UpdateDissagregationSchemeQuery {

  @Autowired
  DatabaseConfig databaseConfig;

  /**
   * Updates a dissagregationScheme record
   *
   * @param dissagregationScheme   a bean containing the dissagregationScheme record details
   * @return the number of dissagregationsSchemes records affected by the query i.e. updated
   */
  public Mono<Integer> updateDissagregationScheme(DissagregationScheme dissagregationScheme) {

    log.trace("Entering updateDissagregationScheme()");

    String query = "UPDATE dissagregation_scheme SET data = ?::jsonb WHERE id = ?";

    return
        Mono.from(
            databaseConfig
                .getDatabase()
                .update(query)
                .parameters(
                    dissagregationScheme.getData(),
                    dissagregationScheme.getId())
                .counts());
  }
}

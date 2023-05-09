/*
 * Copyright (C) 2021 Second Mile
 *
 * This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0.
 * If a copy of the MPL was not distributed with this file,
 * You can obtain one at http://mozilla.org/MPL/2.0/.
 */
package ke.co.miles.optionstypes.repository.updation;

import ke.co.miles.optionstypes.configurations.DatabaseConfig;
import ke.co.miles.optionstypes.models.OptionType;
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
public class UpdateOptionTypeQuery {

  @Autowired
  DatabaseConfig databaseConfig;

  /**
   * Updates a optionType record
   *
   * @param optionType   a bean containing the optionType record details
   * @return the number of optionsTypes records affected by the query i.e. updated
   */
  public Mono<Integer> updateOptionType(OptionType optionType) {

    log.trace("Entering updateOptionType()");

    String query = "UPDATE option_type SET data = ?::jsonb WHERE id = ?";

    return
        Mono.from(
            databaseConfig
                .getDatabase()
                .update(query)
                .parameters(
                    optionType.getData(),
                    optionType.getId())
                .counts());
  }
}

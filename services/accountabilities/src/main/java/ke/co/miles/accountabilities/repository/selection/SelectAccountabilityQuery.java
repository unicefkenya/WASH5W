/*
 * Copyright (C) 2021 Second Mile
 *
 * This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0.
 * If a copy of the MPL was not distributed with this file,
 * You can obtain one at http://mozilla.org/MPL/2.0/.
 */
package ke.co.miles.accountabilities.repository.selection;

import ke.co.miles.accountabilities.configurations.DatabaseConfig;
import ke.co.miles.accountabilities.models.Accountability;
import ke.co.miles.accountabilities.util.builders.AccountabilityBuilder;
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
public class SelectAccountabilityQuery {

  @Autowired
  DatabaseConfig databaseConfig;

  /**
   * Selects an accountability record from the database given its unique identifier
   *
   * @param database the name of the database from which the accountability record should be
   *                 selected
   * @param id       the unique identifier of the accountability record to be selected
   * @return the accountability record with the given id if found
   */
  public Mono<Accountability> selectAccountability(String database, Long id) {

    log.trace("Entering selectAccountability()");

    String query = "SELECT * FROM accountability WHERE id = ?";

    return
        Mono.from(
            databaseConfig
                .getDatabase(database)
                .select(query)
                .parameters(id)
                .get(rs ->
                    new AccountabilityBuilder()
                        .id(rs.getLong("id"))
                        .data(rs.getString("data"))
                        .version(rs.getInt("version"))
                        .build()));
  }

}

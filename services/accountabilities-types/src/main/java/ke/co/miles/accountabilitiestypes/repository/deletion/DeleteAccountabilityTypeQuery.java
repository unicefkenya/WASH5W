/*
 * Copyright (C) 2021 Second Mile
 *
 * This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0.
 * If a copy of the MPL was not distributed with this file,
 * You can obtain one at http://mozilla.org/MPL/2.0/.
 */
package ke.co.miles.accountabilitiestypes.repository.deletion;

import ke.co.miles.accountabilitiestypes.configurations.DatabaseConfig;
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
public class DeleteAccountabilityTypeQuery {

  @Autowired
  DatabaseConfig databaseConfig;

  /**
   * Deletes an accountability type record from the database
   *
   * @param database the name of the database from which the accountability type record deletion
   *                 should be made
   * @param id       the unique identifier of the accountability type record to be deleted
   * @return the number of accountabilities types records affected by the query i.e. deleted
   */
  public Mono<Integer> deleteAccountabilityType(String database, Long id) {

    log.trace("Entering deleteAccountabilityType");

    String query = "DELETE FROM accountability_type WHERE id = ?";

    return
        Mono.from(
            databaseConfig
                .getDatabase(database)
                .update(query)
                .parameters(id)
                .counts());
  }

}

/*
 * Copyright (C) 2021 Second Mile
 *
 * This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0.
 * If a copy of the MPL was not distributed with this file,
 * You can obtain one at http://mozilla.org/MPL/2.0/.
 */
package ke.co.miles.accountabilities.repository.updation;

import ke.co.miles.accountabilities.configurations.DatabaseConfig;
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
public class UpdateAccountabilitiesEntityNamesQuery {

  @Autowired
  DatabaseConfig databaseConfig;

  /**
   * Updates commissioning or responsible entity names of an accountability record
   *
   * @param database   the name of the database within which the accountability record update
   *                   should be made
   * @param entityId   the unique identifier of the commissioning or responsible entity whose name
   *                   should be updated
   * @param entityName the name to which the commissioning or responsible entity should be updated
   * @return the number of accountabilities records affected by the query i.e. updated
   */
  public Mono<Integer> updateAccountabilitiesEntityNames(String database,
      Long entityId, String entityName) {

    log.trace("Entering updateAccountabilitiesEntityNames()");

    String query = "WITH required_updates AS ( "
        + "SELECT count(id) FROM accountability WHERE ("
        + "data -> 'commissioner' ->> 'id' = '" + entityId + "' OR "
        + "data -> 'responsible' ->> 'id' = '" + entityId + "')"
        + "),"
        + "responsible_update AS ( "
        + "UPDATE accountability SET data = jsonb_set("
        + "data, '{responsible}', data -> 'responsible' || '{\"name\": \"" + entityName + "\"}') "
        + "WHERE data -> 'responsible' ->> 'id' = '" + entityId + "'"
        + "),"
        + "commissioner_update AS ( "
        + "UPDATE accountability SET data = jsonb_set("
        + "data, '{commissioner}', data -> 'commissioner' || '{\"name\": \"" + entityName + "\"}') "
        + "WHERE data -> 'commissioner' ->> 'id' = '" + entityId + "'"
        + ")"
        + "SELECT count FROM required_updates;";

    return
        Mono.from(
            databaseConfig
                .getDatabase(database)
                .select(query)
                .get(rs -> rs.getInt("count")));
  }
}

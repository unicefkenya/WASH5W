/*
 * Copyright (C) 2021 Second Mile
 *
 * This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0.
 * If a copy of the MPL was not distributed with this file,
 * You can obtain one at http://mozilla.org/MPL/2.0/.
 */
package ke.co.miles.organisations.repository.insertion;

import ke.co.miles.organisations.configurations.DatabaseConfig;
import ke.co.miles.organisations.models.Organisation;
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
public class InsertOrganisationQuery {

  @Autowired
  DatabaseConfig databaseConfig;

  /**
   * Inserts a new organisation record into the database
   *
   * @param organisation   a bean containing the organisation record details
   * @return the unique identifier of the newly inserted organisation record
   */
  public Mono<Long> insertOrganisation(Organisation organisation) {

    log.trace("Entering insertOrganisation()");

    String query = "INSERT INTO organisation(data) VALUES(?::jsonb)";

    return
        Mono.from(
            databaseConfig
                .getDatabase()
                .update(query)
                .parameters(
                    organisation.getData())
                .returnGeneratedKeys()
                .getAs(Long.class));
  }

}

/*
 * Copyright (C) 2021 Second Mile
 *
 * This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0.
 * If a copy of the MPL was not distributed with this file,
 * You can obtain one at http://mozilla.org/MPL/2.0/.
 */
package ke.co.miles.organisationstypes.repository.insertion;

import ke.co.miles.organisationstypes.configurations.DatabaseConfig;
import ke.co.miles.organisationstypes.models.OrganisationType;
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
public class InsertOrganisationTypeQuery {

  @Autowired
  DatabaseConfig databaseConfig;

  /**
   * Inserts a new organisationType record into the database
   *
   * @param organisationType   a bean containing the organisationType record details
   * @return the unique identifier of the newly inserted organisationType record
   */
  public Mono<Long> insertOrganisationType(OrganisationType organisationType) {

    log.trace("Entering insertOrganisationType()");

    String query = "INSERT INTO organisation_type(data) VALUES(?::jsonb)";

    return
        Mono.from(
            databaseConfig
                .getDatabase()
                .update(query)
                .parameters(
                    organisationType.getData())
                .returnGeneratedKeys()
                .getAs(Long.class));
  }

}

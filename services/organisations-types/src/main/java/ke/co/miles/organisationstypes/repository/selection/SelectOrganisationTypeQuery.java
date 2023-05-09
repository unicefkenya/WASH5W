/*
 * Copyright (C) 2021 Second Mile
 *
 * This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0.
 * If a copy of the MPL was not distributed with this file,
 * You can obtain one at http://mozilla.org/MPL/2.0/.
 */
package ke.co.miles.organisationstypes.repository.selection;

import ke.co.miles.organisationstypes.configurations.DatabaseConfig;
import ke.co.miles.organisationstypes.models.OrganisationType;
import ke.co.miles.organisationstypes.util.builders.OrganisationTypeBuilder;
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
public class SelectOrganisationTypeQuery {

  @Autowired
  DatabaseConfig databaseConfig;

  /**
   * Selects a organisationType record from the database given its unique identifier
   *
   * @param id the unique identifier of the organisationType record to be selected
   * @return the organisationType record with the given id if found
   */
  public Mono<OrganisationType> selectOrganisationType(Long id) {

    log.trace("Entering selectOrganisationType()");

    String query = "SELECT * FROM organisation_type WHERE id = ?";

    return
        Mono.from(
            databaseConfig
                .getDatabase()
                .select(query)
                .parameters(id)
                .get(rs ->
                    new OrganisationTypeBuilder()
                        .id(rs.getLong("id"))
                        .data(rs.getString("data"))
                        .version(rs.getInt("version"))
                        .build()));
  }

}

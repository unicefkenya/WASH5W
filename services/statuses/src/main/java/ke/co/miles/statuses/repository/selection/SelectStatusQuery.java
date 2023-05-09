/*
 * Copyright (C) 2021 Second Mile
 *
 * This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0.
 * If a copy of the MPL was not distributed with this file,
 * You can obtain one at http://mozilla.org/MPL/2.0/.
 */
package ke.co.miles.statuses.repository.selection;

import ke.co.miles.statuses.configurations.DatabaseConfig;
import ke.co.miles.statuses.models.Status;
import ke.co.miles.statuses.util.builders.StatusBuilder;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;
import reactor.core.publisher.Mono;

/**
 * @since 1.0
 * @author Kwaje Anthony <tony@miles.co.ke>
 * @version 1.0
 */
@Component
@Slf4j
public class SelectStatusQuery {

	@Autowired
    DatabaseConfig databaseConfig;

	/**
	 * Selects an status record from the database given its unique identifier
	 *
	 * @param database the name of the database from which the status record should be selected
	 * @param id the unique identifier of the status record to be selected
	 *
	 * @return the status record with the given id if found
	 */
	public Mono<Status> selectStatus(String database, Long id) {

		log.trace("Entering selectStatus()");

		String query = "SELECT * FROM status WHERE id = ?";

		return
			Mono.from(
				databaseConfig
					.getDatabase(database)
					.select(query)
					.parameters(id)
					.get(rs ->
							new StatusBuilder()
									.id(rs.getLong("id"))
									.data(rs.getString("data"))
									.version(rs.getInt("version"))
									.build()));
	}

}

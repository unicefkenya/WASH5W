/*
 * Copyright (C) 2021 Second Mile
 *
 * This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0.
 * If a copy of the MPL was not distributed with this file,
 * You can obtain one at http://mozilla.org/MPL/2.0/.
 */
package ke.co.miles.statuses.repository.updation;

import ke.co.miles.statuses.configurations.DatabaseConfig;
import ke.co.miles.statuses.models.Status;
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
public class UpdateStatusQuery {

	@Autowired
    DatabaseConfig databaseConfig;

	/**
	 * Updates an status record
	 *
	 * @param database the name of the database to which the status record update should be made
	 * @param status a bean containing the status record details
	 *
	 * @return the number of statuses records affected by the query i.e. updated
	 */
	public Mono<Integer> updateStatus(String database, Status status){
		
		log.trace("Entering updateStatus()");

		String query = "UPDATE status SET data = ?::jsonb WHERE id = ?";

		return
			Mono.from(
				databaseConfig
					.getDatabase(database)
					.update(query)
					.parameters(
							status.getData(),
							status.getId())
					.counts());
	}
}

/*
 * Copyright (C) 2021 Second Mile
 *
 * This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0.
 * If a copy of the MPL was not distributed with this file,
 * You can obtain one at http://mozilla.org/MPL/2.0/.
 */
package ke.co.miles.levels.repository.updation;

import ke.co.miles.levels.configurations.DatabaseConfig;
import ke.co.miles.levels.models.Level;
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
public class UpdateLevelQuery {

	@Autowired
    DatabaseConfig databaseConfig;

	/**
	 * Updates an level record
	 *
	 * @param database the name of the database to which the level record update should be made
	 * @param level a bean containing the level record details
	 *
	 * @return the number of levels records affected by the query i.e. updated
	 */
	public Mono<Integer> updateLevel(String database, Level level){
		
		log.trace("Entering updateLevel()");

		String query = "UPDATE level SET data = ?::jsonb WHERE id = ?";

		return
			Mono.from(
				databaseConfig
					.getDatabase(database)
					.update(query)
					.parameters(
							level.getData(),
							level.getId())
					.counts());
	}
}

/*
 * Copyright (C) 2021 Second Mile
 *
 * This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0.
 * If a copy of the MPL was not distributed with this file,
 * You can obtain one at http://mozilla.org/MPL/2.0/.
 */
package ke.co.miles.levels.repository.deletion;

import ke.co.miles.levels.configurations.DatabaseConfig;
import ke.co.miles.levels.util.builders.QueryWhereClauseBuilder;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;
import org.springframework.util.MultiValueMap;
import reactor.core.publisher.Mono;

/**
 * @since 1.0
 * @author Kwaje Anthony <tony@miles.co.ke>
 * @version 1.0
 */
@Component
@Slf4j
public class DeleteLevelsQuery {

	@Autowired
    DatabaseConfig databaseConfig;

	/**
	 * Deletes all or specific levels records from the database - depending on whether
	 * query parameters were supplied as part of the query
	 *
	 * @param database the name of the database from which the level record deletion should be made
	 * @param parameters the query parameters passed along with the request
	 *
	 * @return the number of levels records affected by the query i.e. deleted
	 */		
	public Mono<Integer> deleteLevels(String database, MultiValueMap<String,String> parameters){

		log.trace("Entering deleteLevels");

		String query =
				"DELETE FROM level" +
						new QueryWhereClauseBuilder()
								.queryParameters(parameters)
								.build();

		return
			Mono.from(
				databaseConfig
					.getDatabase(database)
					.update(query)
					.counts());
	}	

}

/*
 * Copyright (C) 2021 Second Mile
 *
 * This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0.
 * If a copy of the MPL was not distributed with this file,
 * You can obtain one at http://mozilla.org/MPL/2.0/.
 */
package ke.co.miles.types.repository.updation;

import ke.co.miles.types.configurations.DatabaseConfig;
import ke.co.miles.types.models.Type;
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
public class UpdateTypeQuery {

	@Autowired
    DatabaseConfig databaseConfig;

	/**
	 * Updates an type record
	 *
	 * @param database the name of the database to which the type record update should be made
	 * @param type a bean containing the type record details
	 *
	 * @return the number of types records affected by the query i.e. updated
	 */
	public Mono<Integer> updateType(String database, Type type){
		
		log.trace("Entering updateType()");

		String query = "UPDATE type SET data = ?::jsonb WHERE id = ?";

		return
			Mono.from(
				databaseConfig
					.getDatabase(database)
					.update(query)
					.parameters(
							type.getData(),
							type.getId())
					.counts());
	}
}

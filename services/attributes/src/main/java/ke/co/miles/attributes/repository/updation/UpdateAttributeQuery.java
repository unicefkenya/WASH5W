/*
 * Copyright (C) 2021 Second Mile
 *
 * This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0.
 * If a copy of the MPL was not distributed with this file,
 * You can obtain one at http://mozilla.org/MPL/2.0/.
 */
package ke.co.miles.attributes.repository.updation;

import ke.co.miles.attributes.configurations.DatabaseConfig;
import ke.co.miles.attributes.models.Attribute;
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
public class UpdateAttributeQuery {

	@Autowired
    DatabaseConfig databaseConfig;

	/**
	 * Updates an attribute record
	 *
	 * @param database the name of the database to which the attribute record update should be made
	 * @param attribute a bean containing the attribute record details
	 *
	 * @return the number of attributes records affected by the query i.e. updated
	 */
	public Mono<Integer> updateAttribute(String database, Attribute attribute){
		
		log.trace("Entering updateAttribute()");

		String query = "UPDATE attribute SET data = ?::jsonb WHERE id = ?";

		return
			Mono.from(
				databaseConfig
					.getDatabase(database)
					.update(query)
					.parameters(
							attribute.getData(),
							attribute.getId())
					.counts());
	}
}

/*
 * Copyright (C) 2021 Second Mile
 *
 * This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0.
 * If a copy of the MPL was not distributed with this file,
 * You can obtain one at http://mozilla.org/MPL/2.0/.
 */
package ke.co.miles.attributes.repository.selection;

import ke.co.miles.attributes.configurations.DatabaseConfig;
import ke.co.miles.attributes.models.Attribute;
import ke.co.miles.attributes.util.builders.AttributeBuilder;
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
public class SelectAttributeQuery {

	@Autowired
    DatabaseConfig databaseConfig;

	/**
	 * Selects an attribute record from the database given its unique identifier
	 *
	 * @param database the name of the database from which the attribute record should be selected
	 * @param id the unique identifier of the attribute record to be selected
	 *
	 * @return the attribute record with the given id if found
	 */
	public Mono<Attribute> selectAttribute(String database, Long id) {

		log.trace("Entering selectAttribute()");

		String query = "SELECT * FROM attribute WHERE id = ?";

		return
			Mono.from(
				databaseConfig
					.getDatabase(database)
					.select(query)
					.parameters(id)
					.get(rs ->
							new AttributeBuilder()
									.id(rs.getLong("id"))
									.data(rs.getString("data"))
									.version(rs.getInt("version"))
									.build()));
	}

}

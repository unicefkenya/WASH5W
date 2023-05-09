/*
 * Copyright (C) 2021 Second Mile
 *
 * This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0.
 * If a copy of the MPL was not distributed with this file,
 * You can obtain one at http://mozilla.org/MPL/2.0/.
 */
package ke.co.miles.groups.repository.updation;

import ke.co.miles.groups.configurations.DatabaseConfig;
import ke.co.miles.groups.models.Group;
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
public class UpdateGroupQuery {

	@Autowired
    DatabaseConfig databaseConfig;

	/**
	 * Updates an group record
	 *
	 * @param database the name of the database to which the group record update should be made
	 * @param group a bean containing the group record details
	 *
	 * @return the number of groups records affected by the query i.e. updated
	 */
	public Mono<Integer> updateGroup(String database, Group group){
		
		log.trace("Entering updateGroup()");

		String query = "UPDATE _group SET data = ?::jsonb WHERE id = ?";

		return
			Mono.from(
				databaseConfig
					.getDatabase(database)
					.update(query)
					.parameters(
							group.getData(),
							group.getId())
					.counts());
	}
}

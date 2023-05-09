/*
 * Copyright (C) 2021 Second Mile
 *
 * This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0.
 * If a copy of the MPL was not distributed with this file,
 * You can obtain one at http://mozilla.org/MPL/2.0/.
 */
package ke.co.miles.roles.repository.updation;

import ke.co.miles.roles.configurations.DatabaseConfig;
import ke.co.miles.roles.models.Role;
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
public class UpdateRoleQuery {

	@Autowired
    DatabaseConfig databaseConfig;

	/**
	 * Updates an role record
	 *
	 * @param database the name of the database to which the role record update should be made
	 * @param role a bean containing the role record details
	 *
	 * @return the number of roles records affected by the query i.e. updated
	 */
	public Mono<Integer> updateRole(String database, Role role){
		
		log.trace("Entering updateRole()");

		String query = "UPDATE _role SET data = ?::jsonb WHERE id = ?";

		return
			Mono.from(
				databaseConfig
					.getDatabase(database)
					.update(query)
					.parameters(
							role.getData(),
							role.getId())
					.counts());
	}
}

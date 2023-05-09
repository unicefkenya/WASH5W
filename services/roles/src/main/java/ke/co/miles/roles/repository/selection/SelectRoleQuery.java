/*
 * Copyright (C) 2021 Second Mile
 *
 * This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0.
 * If a copy of the MPL was not distributed with this file,
 * You can obtain one at http://mozilla.org/MPL/2.0/.
 */
package ke.co.miles.roles.repository.selection;

import ke.co.miles.roles.configurations.DatabaseConfig;
import ke.co.miles.roles.models.Role;
import ke.co.miles.roles.util.builders.RoleBuilder;
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
public class SelectRoleQuery {

	@Autowired
    DatabaseConfig databaseConfig;

	/**
	 * Selects an role record from the database given its unique identifier
	 *
	 * @param database the name of the database from which the role record should be selected
	 * @param id the unique identifier of the role record to be selected
	 *
	 * @return the role record with the given id if found
	 */
	public Mono<Role> selectRole(String database, Long id) {

		log.trace("Entering selectRole()");

		String query = "SELECT * FROM _role WHERE id = ?";

		return
			Mono.from(
				databaseConfig
					.getDatabase(database)
					.select(query)
					.parameters(id)
					.get(rs ->
							new RoleBuilder()
									.id(rs.getLong("id"))
									.data(rs.getString("data"))
									.version(rs.getInt("version"))
									.build()));
	}

}

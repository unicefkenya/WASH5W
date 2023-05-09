/*
 * Copyright (C) 2021 Second Mile
 *
 * This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0.
 * If a copy of the MPL was not distributed with this file,
 * You can obtain one at http://mozilla.org/MPL/2.0/.
 */
package ke.co.miles.accountabilitieshierarchies.repository.deletion;

import ke.co.miles.accountabilitieshierarchies.configurations.DatabaseConfig;
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
public class DeleteAccountabilityHierarchyQuery {

	@Autowired
    DatabaseConfig databaseConfig;

	/**
	 * Deletes an accountability hierarchy record from the database
	 *
	 * @param database the name of the database from which the accountability hierarchy record deletion should be made
	 * @param id the unique identifier of the accountability hierarchy record to be deleted
	 *
	 * @return the number of accountabilities hierarchies records affected by the query i.e. deleted
	 */	
	public Mono<Integer> deleteAccountabilityHierarchy(String database, Long id){

		log.trace("Entering deleteAccountabilityHierarchy");

		String query = "DELETE FROM accountability_hierarchy WHERE id = ?";

		return
			Mono.from(
				databaseConfig
					.getDatabase(database)
					.update(query)
					.parameters(id)
					.counts());
	}

}

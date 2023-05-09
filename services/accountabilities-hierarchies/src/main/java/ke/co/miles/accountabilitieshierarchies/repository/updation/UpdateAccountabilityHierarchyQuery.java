/*
 * Copyright (C) 2021 Second Mile
 *
 * This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0.
 * If a copy of the MPL was not distributed with this file,
 * You can obtain one at http://mozilla.org/MPL/2.0/.
 */
package ke.co.miles.accountabilitieshierarchies.repository.updation;

import ke.co.miles.accountabilitieshierarchies.configurations.DatabaseConfig;
import ke.co.miles.accountabilitieshierarchies.models.AccountabilityHierarchy;
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
public class UpdateAccountabilityHierarchyQuery {

	@Autowired
    DatabaseConfig databaseConfig;

	/**
	 * Updates an accountability hierarchy record
	 *
	 * @param database the name of the database to which the accountability hierarchy record update should be made
	 * @param accountabilityHierarchy a bean containing the accountability hierarchy record details
	 *
	 * @return the number of accountabilities hierarchies records affected by the query i.e. updated
	 */
	public Mono<Integer> updateAccountabilityHierarchy(String database, AccountabilityHierarchy accountabilityHierarchy){
		
		log.trace("Entering updateAccountabilityHierarchy()");

		String query = "UPDATE accountability_hierarchy SET data = ?::jsonb WHERE id = ?";

		return
			Mono.from(
				databaseConfig
					.getDatabase(database)
					.update(query)
					.parameters(
							accountabilityHierarchy.getData(),
							accountabilityHierarchy.getId())
					.counts());
	}
}

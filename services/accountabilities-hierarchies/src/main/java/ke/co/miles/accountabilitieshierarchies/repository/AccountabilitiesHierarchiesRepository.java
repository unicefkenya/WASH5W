/*
 * Copyright (C) 2021 Second Mile
 *
 * This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0.
 * If a copy of the MPL was not distributed with this file,
 * You can obtain one at http://mozilla.org/MPL/2.0/.
 */
package ke.co.miles.accountabilitieshierarchies.repository;


import ke.co.miles.accountabilitieshierarchies.models.AccountabilityHierarchy;
import ke.co.miles.accountabilitieshierarchies.repository.deletion.DeleteAccountabilityHierarchyQuery;
import ke.co.miles.accountabilitieshierarchies.repository.deletion.DeleteAccountabilitiesHierarchiesQuery;
import ke.co.miles.accountabilitieshierarchies.repository.insertion.InsertAccountabilityHierarchyQuery;
import ke.co.miles.accountabilitieshierarchies.repository.insertion.InsertAccountabilitiesHierarchiesQuery;
import ke.co.miles.accountabilitieshierarchies.repository.selection.SelectAccountabilityHierarchyQuery;
import ke.co.miles.accountabilitieshierarchies.repository.selection.SelectAccountabilitiesHierarchiesQuery;
import ke.co.miles.accountabilitieshierarchies.repository.selection.SelectTotalAccountabilitiesHierarchiesQuery;
import ke.co.miles.accountabilitieshierarchies.repository.updation.UpdateAccountabilityHierarchyQuery;
import ke.co.miles.accountabilitieshierarchies.repository.updation.UpdateAccountabilitiesHierarchiesQuery;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;
import org.springframework.util.MultiValueMap;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

/**
 * @since 1.0
 * @author Kwaje Anthony <tony@miles.co.ke>
 * @version 1.0
 */
@Component
@Slf4j
public class AccountabilitiesHierarchiesRepository {

	@Autowired
	InsertAccountabilityHierarchyQuery insertAccountabilityHierarchyQuery;
	
	@Autowired
	InsertAccountabilitiesHierarchiesQuery insertAccountabilitiesHierarchiesQuery;
	
	@Autowired
	SelectAccountabilityHierarchyQuery selectAccountabilityHierarchyQuery;
	
	@Autowired
	SelectAccountabilitiesHierarchiesQuery selectAccountabilitiesHierarchiesQuery;

	@Autowired
	SelectTotalAccountabilitiesHierarchiesQuery selectTotalAccountabilitiesHierarchiesQuery;

	@Autowired
	UpdateAccountabilityHierarchyQuery updateAccountabilityHierarchyQuery;
	
	@Autowired
	UpdateAccountabilitiesHierarchiesQuery updateAccountabilitiesHierarchiesQuery;
	
	@Autowired
	DeleteAccountabilityHierarchyQuery deleteAccountabilityHierarchyQuery;
	
	@Autowired
    DeleteAccountabilitiesHierarchiesQuery deleteAccountabilitiesHierarchiesQuery;

	public Mono<Long> insertAccountabilityHierarchy(String database, AccountabilityHierarchy accountabilityHierarchy) {
		return insertAccountabilityHierarchyQuery.insertAccountabilityHierarchy(database, accountabilityHierarchy);
	}
	
	public Flux<Long> insertAccountabilitiesHierarchies(String database, AccountabilityHierarchy[] accountabilitiesHierarchies) {
		return insertAccountabilitiesHierarchiesQuery.insertAccountabilitiesHierarchies(database, accountabilitiesHierarchies);
	}

	public Mono<AccountabilityHierarchy> selectAccountabilityHierarchy(String database, Long id) {
		return selectAccountabilityHierarchyQuery.selectAccountabilityHierarchy(database, id);
	}
	
	public Flux<AccountabilityHierarchy> selectAccountabilitiesHierarchies(String database, MultiValueMap<String,String> parameters) {
		return selectAccountabilitiesHierarchiesQuery.selectAccountabilitiesHierarchies(database, parameters);
	}

	public Mono<Long> selectTotalAccountabilitiesHierarchies(String database, MultiValueMap<String,String> parameters) {
		return selectTotalAccountabilitiesHierarchiesQuery.selectTotalAccountabilitiesHierarchies(database, parameters);
	}

	public Mono<Integer> updateAccountabilityHierarchy(String database, AccountabilityHierarchy accountabilityHierarchy) {
		return updateAccountabilityHierarchyQuery.updateAccountabilityHierarchy(database, accountabilityHierarchy);
	}
	
	public Flux<Integer> updateAccountabilitiesHierarchies(String database, AccountabilityHierarchy[] accountabilitiesHierarchies) {
		return updateAccountabilitiesHierarchiesQuery.updateAccountabilitiesHierarchies(database, accountabilitiesHierarchies);
	}	
	
	public Mono<Integer> deleteAccountabilityHierarchyById(String database, Long id) {
		return deleteAccountabilityHierarchyQuery.deleteAccountabilityHierarchy(database, id);
	}
	
	public Mono<Integer> deleteAccountabilitiesHierarchies(String database, MultiValueMap<String,String> parameters) {
		return deleteAccountabilitiesHierarchiesQuery.deleteAccountabilitiesHierarchies(database, parameters);
	}

}

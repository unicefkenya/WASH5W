/*
 * Copyright (C) 2021 Second Mile
 *
 * This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0.
 * If a copy of the MPL was not distributed with this file,
 * You can obtain one at http://mozilla.org/MPL/2.0/.
 */
package ke.co.miles.accountabilitiestypes.repository;


import ke.co.miles.accountabilitiestypes.models.AccountabilityType;
import ke.co.miles.accountabilitiestypes.repository.deletion.DeleteAccountabilitiesTypesQuery;
import ke.co.miles.accountabilitiestypes.repository.deletion.DeleteAccountabilityTypeQuery;
import ke.co.miles.accountabilitiestypes.repository.insertion.InsertAccountabilitiesTypesQuery;
import ke.co.miles.accountabilitiestypes.repository.insertion.InsertAccountabilityTypeQuery;
import ke.co.miles.accountabilitiestypes.repository.selection.SelectAccountabilitiesTypesQuery;
import ke.co.miles.accountabilitiestypes.repository.selection.SelectAccountabilityTypeQuery;
import ke.co.miles.accountabilitiestypes.repository.selection.SelectAscendantAccountabilitiesTypesQuery;
import ke.co.miles.accountabilitiestypes.repository.selection.SelectDescendantAccountabilitiesTypesQuery;
import ke.co.miles.accountabilitiestypes.repository.selection.SelectTotalAccountabilitiesTypesQuery;
import ke.co.miles.accountabilitiestypes.repository.updation.UpdateAccountabilitiesTypesEntityNamesQuery;
import ke.co.miles.accountabilitiestypes.repository.updation.UpdateAccountabilitiesTypesQuery;
import ke.co.miles.accountabilitiestypes.repository.updation.UpdateAccountabilityTypeQuery;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;
import org.springframework.util.MultiValueMap;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

/**
 * @author Kwaje Anthony <tony@miles.co.ke>
 * @version 1.0
 * @since 1.0
 */
@Component
@Slf4j
public class AccountabilitiesTypesRepository {

  @Autowired
  InsertAccountabilityTypeQuery insertAccountabilityTypeQuery;

  @Autowired
  InsertAccountabilitiesTypesQuery insertAccountabilitiesTypesQuery;

  @Autowired
  SelectAccountabilityTypeQuery selectAccountabilityTypeQuery;

  @Autowired
  SelectAccountabilitiesTypesQuery selectAccountabilitiesTypesQuery;

  @Autowired
  SelectDescendantAccountabilitiesTypesQuery selectDescendantAccountabilitiesTypesQuery;

  @Autowired
  SelectAscendantAccountabilitiesTypesQuery selectAscendantAccountabilitiesTypesQuery;

  @Autowired
  SelectTotalAccountabilitiesTypesQuery selectTotalAccountabilitiesTypesQuery;

  @Autowired
  UpdateAccountabilityTypeQuery updateAccountabilityTypeQuery;

  @Autowired
  UpdateAccountabilitiesTypesQuery updateAccountabilitiesTypesQuery;

  @Autowired
  UpdateAccountabilitiesTypesEntityNamesQuery updateAccountabilitiesTypesEntityNamesQuery;

  @Autowired
  DeleteAccountabilityTypeQuery deleteAccountabilityTypeQuery;

  @Autowired
  DeleteAccountabilitiesTypesQuery deleteAccountabilitiesTypesQuery;

  public Mono<Long> insertAccountabilityType(String database,
      AccountabilityType accountabilityType) {
    return insertAccountabilityTypeQuery.insertAccountabilityType(database, accountabilityType);
  }

  public Flux<Long> insertAccountabilitiesTypes(String database,
      AccountabilityType[] accountabilitiesTypes) {
    return insertAccountabilitiesTypesQuery.insertAccountabilitiesTypes(database,
        accountabilitiesTypes);
  }

  public Mono<AccountabilityType> selectAccountabilityType(String database, Long id) {
    return selectAccountabilityTypeQuery.selectAccountabilityType(database, id);
  }

  public Flux<AccountabilityType> selectAccountabilitiesTypes(String database,
      MultiValueMap<String, String> parameters) {
    return selectAccountabilitiesTypesQuery.selectAccountabilitiesTypes(database, parameters);
  }

  public Flux<AccountabilityType> selectAscendantAccountabilitiesTypes(String database,
      Long hierarchy, Long responsible, MultiValueMap<String, String> parameters) {
    return selectAscendantAccountabilitiesTypesQuery.selectAscendantAccountabilitiesTypes(database,
        hierarchy, responsible, parameters);
  }

  public Flux<AccountabilityType> selectDescendantAccountabilitiesTypes(String database,
      Long hierarchy, Long commissioner, MultiValueMap<String, String> parameters) {
    return selectDescendantAccountabilitiesTypesQuery.selectDescendantAccountabilitiesTypes(
        database, hierarchy, commissioner, parameters);
  }

  public Mono<Long> selectTotalAccountabilitiesTypes(String database,
      MultiValueMap<String, String> parameters) {
    return selectTotalAccountabilitiesTypesQuery.selectTotalAccountabilitiesTypes(database,
        parameters);
  }

  public Mono<Integer> updateAccountabilityType(String database,
      AccountabilityType accountabilityType) {
    return updateAccountabilityTypeQuery.updateAccountabilityType(database, accountabilityType);
  }

  public Flux<Integer> updateAccountabilitiesTypes(String database,
      AccountabilityType[] accountabilitiesTypes) {
    return updateAccountabilitiesTypesQuery.updateAccountabilitiesTypes(database,
        accountabilitiesTypes);
  }

  public Mono<Integer> updateAccountabilitiesTypesEntityNames(String database, Long entityId,
      String entityName) {
    return updateAccountabilitiesTypesEntityNamesQuery.updateAccountabilitiesTypesEntityNames(
        database, entityId, entityName);
  }

  public Mono<Integer> deleteAccountabilityTypeById(String database, Long id) {
    return deleteAccountabilityTypeQuery.deleteAccountabilityType(database, id);
  }

  public Mono<Integer> deleteAccountabilitiesTypes(String database,
      MultiValueMap<String, String> parameters) {
    return deleteAccountabilitiesTypesQuery.deleteAccountabilitiesTypes(database, parameters);
  }

}

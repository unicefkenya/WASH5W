/*
 * Copyright (C) 2021 Second Mile
 *
 * This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0.
 * If a copy of the MPL was not distributed with this file,
 * You can obtain one at http://mozilla.org/MPL/2.0/.
 */
package ke.co.miles.accountabilities.repository;


import ke.co.miles.accountabilities.models.Accountability;
import ke.co.miles.accountabilities.repository.deletion.DeleteAccountabilitiesQuery;
import ke.co.miles.accountabilities.repository.deletion.DeleteAccountabilityQuery;
import ke.co.miles.accountabilities.repository.insertion.InsertAccountabilitiesQuery;
import ke.co.miles.accountabilities.repository.insertion.InsertAccountabilityQuery;
import ke.co.miles.accountabilities.repository.selection.SelectAccountabilitiesQuery;
import ke.co.miles.accountabilities.repository.selection.SelectAccountabilityQuery;
import ke.co.miles.accountabilities.repository.selection.SelectAscendantAccountabilitiesQuery;
import ke.co.miles.accountabilities.repository.selection.SelectDescendantAccountabilitiesQuery;
import ke.co.miles.accountabilities.repository.selection.SelectTotalAccountabilitiesQuery;
import ke.co.miles.accountabilities.repository.updation.UpdateAccountabilitiesEntityNamesQuery;
import ke.co.miles.accountabilities.repository.updation.UpdateAccountabilitiesQuery;
import ke.co.miles.accountabilities.repository.updation.UpdateAccountabilityQuery;
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
public class AccountabilitiesRepository {

  @Autowired
  InsertAccountabilityQuery insertAccountabilityQuery;

  @Autowired
  InsertAccountabilitiesQuery insertAccountabilitiesQuery;

  @Autowired
  SelectAccountabilityQuery selectAccountabilityQuery;

  @Autowired
  SelectAccountabilitiesQuery selectAccountabilitiesQuery;

  @Autowired
  SelectDescendantAccountabilitiesQuery selectDescendantAccountabilitiesQuery;

  @Autowired
  SelectAscendantAccountabilitiesQuery selectAscendantAccountabilitiesQuery;

  @Autowired
  SelectTotalAccountabilitiesQuery selectTotalAccountabilitiesQuery;

  @Autowired
  UpdateAccountabilityQuery updateAccountabilityQuery;

  @Autowired
  UpdateAccountabilitiesQuery updateAccountabilitiesQuery;

  @Autowired
  UpdateAccountabilitiesEntityNamesQuery updateAccountabilitiesEntityNamesQuery;

  @Autowired
  DeleteAccountabilityQuery deleteAccountabilityQuery;

  @Autowired
  DeleteAccountabilitiesQuery deleteAccountabilitiesQuery;

  public Mono<Long> insertAccountability(String database,
      Accountability accountability) {
    return insertAccountabilityQuery.insertAccountability(database, accountability);
  }

  public Flux<Long> insertAccountabilities(String database,
      Accountability[] accountabilities) {
    return insertAccountabilitiesQuery.insertAccountabilities(database,
        accountabilities);
  }

  public Mono<Accountability> selectAccountability(String database, Long id) {
    return selectAccountabilityQuery.selectAccountability(database, id);
  }

  public Flux<Accountability> selectAccountabilities(String database,
      MultiValueMap<String, String> parameters) {
    return selectAccountabilitiesQuery.selectAccountabilities(database, parameters);
  }

  public Flux<Accountability> selectAscendantAccountabilities(String database,
      Long type, Long responsible, MultiValueMap<String, String> parameters) {
    return selectAscendantAccountabilitiesQuery.selectAscendantAccountabilities(database,
        type, responsible, parameters);
  }

  public Flux<Accountability> selectDescendantAccountabilities(String database,
      Long type, Long commissioner, MultiValueMap<String, String> parameters) {
    return selectDescendantAccountabilitiesQuery.selectDescendantAccountabilities(
        database, type, commissioner, parameters);
  }

  public Mono<Long> selectTotalAccountabilities(String database,
      MultiValueMap<String, String> parameters) {
    return selectTotalAccountabilitiesQuery.selectTotalAccountabilities(database,
        parameters);
  }

  public Mono<Integer> updateAccountability(String database,
      Accountability accountability) {
    return updateAccountabilityQuery.updateAccountability(database, accountability);
  }

  public Flux<Integer> updateAccountabilities(String database,
      Accountability[] accountabilities) {
    return updateAccountabilitiesQuery.updateAccountabilities(database,
        accountabilities);
  }

  public Mono<Integer> updateAccountabilitiesEntityNames(String database, Long entityId,
      String entityName) {
    return updateAccountabilitiesEntityNamesQuery.updateAccountabilitiesEntityNames(
        database, entityId, entityName);
  }

  public Mono<Integer> deleteAccountabilityById(String database, Long id) {
    return deleteAccountabilityQuery.deleteAccountability(database, id);
  }

  public Mono<Integer> deleteAccountabilities(String database,
      MultiValueMap<String, String> parameters) {
    return deleteAccountabilitiesQuery.deleteAccountabilities(database, parameters);
  }

}

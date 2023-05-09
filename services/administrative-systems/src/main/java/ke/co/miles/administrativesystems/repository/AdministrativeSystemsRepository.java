/*
 * Copyright (C) 2021 Second Mile
 *
 * This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0.
 * If a copy of the MPL was not distributed with this file,
 * You can obtain one at http://mozilla.org/MPL/2.0/.
 */
package ke.co.miles.administrativesystems.repository;


import ke.co.miles.administrativesystems.models.AdministrativeSystem;
import ke.co.miles.administrativesystems.repository.deletion.DeleteAdministrativeSystemQuery;
import ke.co.miles.administrativesystems.repository.insertion.InsertAdministrativeSystemQuery;
import ke.co.miles.administrativesystems.repository.selection.SelectAdministrativeSystemQuery;
import ke.co.miles.administrativesystems.repository.selection.SelectAdministrativeSystemsQuery;
import ke.co.miles.administrativesystems.repository.selection.SelectTotalAdministrativeSystemsQuery;
import ke.co.miles.administrativesystems.repository.updation.UpdateAdministrativeSystemQuery;
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
public class AdministrativeSystemsRepository {

  @Autowired
  InsertAdministrativeSystemQuery insertAdministrativeSystemQuery;

  @Autowired
  SelectAdministrativeSystemQuery selectAdministrativeSystemQuery;

  @Autowired
  SelectAdministrativeSystemsQuery selectAdministrativeSystemsQuery;

  @Autowired
  SelectTotalAdministrativeSystemsQuery selectTotalAdministrativeSystemsQuery;

  @Autowired
  UpdateAdministrativeSystemQuery updateAdministrativeSystemQuery;

  @Autowired
  DeleteAdministrativeSystemQuery deleteAdministrativeSystemQuery;

  public Mono<Long> insertAdministrativeSystem(AdministrativeSystem administrativeSystem) {
    return insertAdministrativeSystemQuery.insertAdministrativeSystem(administrativeSystem);
  }

  public Mono<AdministrativeSystem> selectAdministrativeSystem(Long id) {
    return selectAdministrativeSystemQuery.selectAdministrativeSystem(id);
  }

  public Flux<AdministrativeSystem> selectAdministrativeSystems(MultiValueMap<String, String> parameters) {
    return selectAdministrativeSystemsQuery.selectAdministrativeSystems(parameters);
  }

  public Mono<Long> selectTotalAdministrativeSystems(MultiValueMap<String, String> parameters) {
    return selectTotalAdministrativeSystemsQuery.selectTotalAdministrativeSystems(parameters);
  }

  public Mono<Integer> updateAdministrativeSystem(AdministrativeSystem administrativeSystem) {
    return updateAdministrativeSystemQuery.updateAdministrativeSystem(administrativeSystem);
  }

  public Mono<Integer> deleteAdministrativeSystemById(Long id) {
    return deleteAdministrativeSystemQuery.deleteAdministrativeSystem(id);
  }


}

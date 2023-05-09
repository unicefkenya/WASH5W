/*
 * Copyright (C) 2021 Second Mile
 *
 * This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0.
 * If a copy of the MPL was not distributed with this file,
 * You can obtain one at http://mozilla.org/MPL/2.0/.
 */
package ke.co.miles.administrativehierarchies.repository;


import ke.co.miles.administrativehierarchies.models.AdministrativeHierarchy;
import ke.co.miles.administrativehierarchies.repository.deletion.DeleteAdministrativeHierarchyQuery;
import ke.co.miles.administrativehierarchies.repository.insertion.InsertAdministrativeHierarchyQuery;
import ke.co.miles.administrativehierarchies.repository.selection.SelectAdministrativeHierarchyQuery;
import ke.co.miles.administrativehierarchies.repository.selection.SelectAdministrativeHierarchiesQuery;
import ke.co.miles.administrativehierarchies.repository.selection.SelectTotalAdministrativeHierarchiesQuery;
import ke.co.miles.administrativehierarchies.repository.updation.UpdateAdministrativeHierarchyQuery;
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
public class AdministrativeHierarchiesRepository {

  @Autowired
  InsertAdministrativeHierarchyQuery insertAdministrativeHierarchyQuery;

  @Autowired
  SelectAdministrativeHierarchyQuery selectAdministrativeHierarchyQuery;

  @Autowired
  SelectAdministrativeHierarchiesQuery selectAdministrativeHierarchiesQuery;

  @Autowired
  SelectTotalAdministrativeHierarchiesQuery selectTotalAdministrativeHierarchiesQuery;

  @Autowired
  UpdateAdministrativeHierarchyQuery updateAdministrativeHierarchyQuery;

  @Autowired
  DeleteAdministrativeHierarchyQuery deleteAdministrativeHierarchyQuery;

  public Mono<Long> insertAdministrativeHierarchy(AdministrativeHierarchy administrativeHierarchy) {
    return insertAdministrativeHierarchyQuery.insertAdministrativeHierarchy(administrativeHierarchy);
  }

  public Mono<AdministrativeHierarchy> selectAdministrativeHierarchy(Long id) {
    return selectAdministrativeHierarchyQuery.selectAdministrativeHierarchy(id);
  }

  public Flux<AdministrativeHierarchy> selectAdministrativeHierarchies(MultiValueMap<String, String> parameters) {
    return selectAdministrativeHierarchiesQuery.selectAdministrativeHierarchies(parameters);
  }

  public Mono<Long> selectTotalAdministrativeHierarchies(MultiValueMap<String, String> parameters) {
    return selectTotalAdministrativeHierarchiesQuery.selectTotalAdministrativeHierarchies(parameters);
  }

  public Mono<Integer> updateAdministrativeHierarchy(AdministrativeHierarchy administrativeHierarchy) {
    return updateAdministrativeHierarchyQuery.updateAdministrativeHierarchy(administrativeHierarchy);
  }

  public Mono<Integer> deleteAdministrativeHierarchyById(Long id) {
    return deleteAdministrativeHierarchyQuery.deleteAdministrativeHierarchy(id);
  }


}

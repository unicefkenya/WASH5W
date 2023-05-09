/*
 * Copyright (C) 2021 Second Mile
 *
 * This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0.
 * If a copy of the MPL was not distributed with this file,
 * You can obtain one at http://mozilla.org/MPL/2.0/.
 */
package ke.co.miles.administrativestructures.repository;


import ke.co.miles.administrativestructures.models.AdministrativeStructure;
import ke.co.miles.administrativestructures.repository.deletion.DeleteAdministrativeStructureQuery;
import ke.co.miles.administrativestructures.repository.insertion.InsertAdministrativeStructureQuery;
import ke.co.miles.administrativestructures.repository.selection.SelectAdministrativeStructureQuery;
import ke.co.miles.administrativestructures.repository.selection.SelectAdministrativeStructuresQuery;
import ke.co.miles.administrativestructures.repository.selection.SelectTotalAdministrativeStructuresQuery;
import ke.co.miles.administrativestructures.repository.updation.UpdateAdministrativeStructureQuery;
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
public class AdministrativeStructuresRepository {

  @Autowired
  InsertAdministrativeStructureQuery insertAdministrativeStructureQuery;

  @Autowired
  SelectAdministrativeStructureQuery selectAdministrativeStructureQuery;

  @Autowired
  SelectAdministrativeStructuresQuery selectAdministrativeStructuresQuery;

  @Autowired
  SelectTotalAdministrativeStructuresQuery selectTotalAdministrativeStructuresQuery;

  @Autowired
  UpdateAdministrativeStructureQuery updateAdministrativeStructureQuery;

  @Autowired
  DeleteAdministrativeStructureQuery deleteAdministrativeStructureQuery;

  public Mono<Long> insertAdministrativeStructure(AdministrativeStructure administrativeStructure) {
    return insertAdministrativeStructureQuery.insertAdministrativeStructure(administrativeStructure);
  }

  public Mono<AdministrativeStructure> selectAdministrativeStructure(Long id) {
    return selectAdministrativeStructureQuery.selectAdministrativeStructure(id);
  }

  public Flux<AdministrativeStructure> selectAdministrativeStructures(MultiValueMap<String, String> parameters) {
    return selectAdministrativeStructuresQuery.selectAdministrativeStructures(parameters);
  }

  public Mono<Long> selectTotalAdministrativeStructures(MultiValueMap<String, String> parameters) {
    return selectTotalAdministrativeStructuresQuery.selectTotalAdministrativeStructures(parameters);
  }

  public Mono<Integer> updateAdministrativeStructure(AdministrativeStructure administrativeStructure) {
    return updateAdministrativeStructureQuery.updateAdministrativeStructure(administrativeStructure);
  }

  public Mono<Integer> deleteAdministrativeStructureById(Long id) {
    return deleteAdministrativeStructureQuery.deleteAdministrativeStructure(id);
  }


}

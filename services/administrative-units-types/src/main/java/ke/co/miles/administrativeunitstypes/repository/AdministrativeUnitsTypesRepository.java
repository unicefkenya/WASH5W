/*
 * Copyright (C) 2021 Second Mile
 *
 * This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0.
 * If a copy of the MPL was not distributed with this file,
 * You can obtain one at http://mozilla.org/MPL/2.0/.
 */
package ke.co.miles.administrativeunitstypes.repository;


import ke.co.miles.administrativeunitstypes.models.AdministrativeUnitType;
import ke.co.miles.administrativeunitstypes.repository.deletion.DeleteAdministrativeUnitTypeQuery;
import ke.co.miles.administrativeunitstypes.repository.insertion.InsertAdministrativeUnitTypeQuery;
import ke.co.miles.administrativeunitstypes.repository.selection.SelectAdministrativeUnitTypeQuery;
import ke.co.miles.administrativeunitstypes.repository.selection.SelectAdministrativeUnitsTypesQuery;
import ke.co.miles.administrativeunitstypes.repository.selection.SelectTotalAdministrativeUnitsTypesQuery;
import ke.co.miles.administrativeunitstypes.repository.updation.UpdateAdministrativeUnitTypeQuery;
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
public class AdministrativeUnitsTypesRepository {

  @Autowired
  InsertAdministrativeUnitTypeQuery insertAdministrativeUnitTypeQuery;

  @Autowired
  SelectAdministrativeUnitTypeQuery selectAdministrativeUnitTypeQuery;

  @Autowired
  SelectAdministrativeUnitsTypesQuery selectAdministrativeUnitsTypesQuery;

  @Autowired
  SelectTotalAdministrativeUnitsTypesQuery selectTotalAdministrativeUnitsTypesQuery;

  @Autowired
  UpdateAdministrativeUnitTypeQuery updateAdministrativeUnitTypeQuery;

  @Autowired
  DeleteAdministrativeUnitTypeQuery deleteAdministrativeUnitTypeQuery;

  public Mono<Long> insertAdministrativeUnitType(AdministrativeUnitType administrativeUnitType) {
    return insertAdministrativeUnitTypeQuery.insertAdministrativeUnitType(administrativeUnitType);
  }

  public Mono<AdministrativeUnitType> selectAdministrativeUnitType(Long id) {
    return selectAdministrativeUnitTypeQuery.selectAdministrativeUnitType(id);
  }

  public Flux<AdministrativeUnitType> selectAdministrativeUnitsTypes(MultiValueMap<String, String> parameters) {
    return selectAdministrativeUnitsTypesQuery.selectAdministrativeUnitsTypes(parameters);
  }

  public Mono<Long> selectTotalAdministrativeUnitsTypes(MultiValueMap<String, String> parameters) {
    return selectTotalAdministrativeUnitsTypesQuery.selectTotalAdministrativeUnitsTypes(parameters);
  }

  public Mono<Integer> updateAdministrativeUnitType(AdministrativeUnitType administrativeUnitType) {
    return updateAdministrativeUnitTypeQuery.updateAdministrativeUnitType(administrativeUnitType);
  }

  public Mono<Integer> deleteAdministrativeUnitTypeById(Long id) {
    return deleteAdministrativeUnitTypeQuery.deleteAdministrativeUnitType(id);
  }


}

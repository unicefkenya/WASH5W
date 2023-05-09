/*
 * Copyright (C) 2021 Second Mile
 *
 * This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0.
 * If a copy of the MPL was not distributed with this file,
 * You can obtain one at http://mozilla.org/MPL/2.0/.
 */
package ke.co.miles.administrativeunits.repository;


import ke.co.miles.administrativeunits.models.AdministrativeUnit;
import ke.co.miles.administrativeunits.repository.deletion.DeleteAdministrativeUnitQuery;
import ke.co.miles.administrativeunits.repository.insertion.InsertAdministrativeUnitQuery;
import ke.co.miles.administrativeunits.repository.selection.SelectAdministrativeUnitQuery;
import ke.co.miles.administrativeunits.repository.selection.SelectAdministrativeUnitsQuery;
import ke.co.miles.administrativeunits.repository.selection.SelectTotalAdministrativeUnitsQuery;
import ke.co.miles.administrativeunits.repository.updation.UpdateAdministrativeUnitQuery;
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
public class AdministrativeUnitsRepository {

  @Autowired
  InsertAdministrativeUnitQuery insertAdministrativeUnitQuery;

  @Autowired
  SelectAdministrativeUnitQuery selectAdministrativeUnitQuery;

  @Autowired
  SelectAdministrativeUnitsQuery selectAdministrativeUnitsQuery;

  @Autowired
  SelectTotalAdministrativeUnitsQuery selectTotalAdministrativeUnitsQuery;

  @Autowired
  UpdateAdministrativeUnitQuery updateAdministrativeUnitQuery;

  @Autowired
  DeleteAdministrativeUnitQuery deleteAdministrativeUnitQuery;

  public Mono<Long> insertAdministrativeUnit(AdministrativeUnit administrativeUnit) {
    return insertAdministrativeUnitQuery.insertAdministrativeUnit(administrativeUnit);
  }

  public Mono<AdministrativeUnit> selectAdministrativeUnit(Long id) {
    return selectAdministrativeUnitQuery.selectAdministrativeUnit(id);
  }

  public Flux<AdministrativeUnit> selectAdministrativeUnits(MultiValueMap<String, String> parameters) {
    return selectAdministrativeUnitsQuery.selectAdministrativeUnits(parameters);
  }

  public Mono<Long> selectTotalAdministrativeUnits(MultiValueMap<String, String> parameters) {
    return selectTotalAdministrativeUnitsQuery.selectTotalAdministrativeUnits(parameters);
  }

  public Mono<Integer> updateAdministrativeUnit(AdministrativeUnit administrativeUnit) {
    return updateAdministrativeUnitQuery.updateAdministrativeUnit(administrativeUnit);
  }

  public Mono<Integer> deleteAdministrativeUnitById(Long id) {
    return deleteAdministrativeUnitQuery.deleteAdministrativeUnit(id);
  }


}

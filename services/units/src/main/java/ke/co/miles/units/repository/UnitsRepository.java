/*
 * Copyright (C) 2021 Second Mile
 *
 * This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0.
 * If a copy of the MPL was not distributed with this file,
 * You can obtain one at http://mozilla.org/MPL/2.0/.
 */
package ke.co.miles.units.repository;


import ke.co.miles.units.models.Unit;
import ke.co.miles.units.repository.deletion.DeleteUnitQuery;
import ke.co.miles.units.repository.insertion.InsertUnitQuery;
import ke.co.miles.units.repository.selection.SelectUnitsQuery;
import ke.co.miles.units.repository.selection.SelectUnitQuery;
import ke.co.miles.units.repository.selection.SelectTotalUnitsQuery;
import ke.co.miles.units.repository.updation.UpdateUnitQuery;
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
public class UnitsRepository {

  @Autowired
  InsertUnitQuery insertUnitQuery;

  @Autowired
  SelectUnitQuery selectUnitQuery;

  @Autowired
  SelectUnitsQuery selectUnitsQuery;

  @Autowired
  SelectTotalUnitsQuery selectTotalUnitsQuery;

  @Autowired
  UpdateUnitQuery updateUnitQuery;

  @Autowired
  DeleteUnitQuery deleteUnitQuery;

  public Mono<Long> insertUnit(Unit unit) {
    return insertUnitQuery.insertUnit(unit);
  }

  public Mono<Unit> selectUnit(Long id) {
    return selectUnitQuery.selectUnit(id);
  }

  public Flux<Unit> selectUnits(MultiValueMap<String, String> parameters) {
    return selectUnitsQuery.selectUnits(parameters);
  }

  public Mono<Long> selectTotalUnits(MultiValueMap<String, String> parameters) {
    return selectTotalUnitsQuery.selectTotalUnits(parameters);
  }

  public Mono<Integer> updateUnit(Unit unit) {
    return updateUnitQuery.updateUnit(unit);
  }

  public Mono<Integer> deleteUnitById(Long id) {
    return deleteUnitQuery.deleteUnit(id);
  }


}

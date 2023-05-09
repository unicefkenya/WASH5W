/*
 * Copyright (C) 2021 Second Mile
 *
 * This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0.
 * If a copy of the MPL was not distributed with this file,
 * You can obtain one at http://mozilla.org/MPL/2.0/.
 */
package ke.co.miles.dissagregations.repository;


import ke.co.miles.dissagregations.models.Dissagregation;
import ke.co.miles.dissagregations.repository.deletion.DeleteDissagregationQuery;
import ke.co.miles.dissagregations.repository.insertion.InsertDissagregationQuery;
import ke.co.miles.dissagregations.repository.selection.SelectDissagregationsQuery;
import ke.co.miles.dissagregations.repository.selection.SelectDissagregationQuery;
import ke.co.miles.dissagregations.repository.selection.SelectTotalDissagregationsQuery;
import ke.co.miles.dissagregations.repository.updation.UpdateDissagregationQuery;
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
public class DissagregationsRepository {

  @Autowired
  InsertDissagregationQuery insertDissagregationQuery;

  @Autowired
  SelectDissagregationQuery selectDissagregationQuery;

  @Autowired
  SelectDissagregationsQuery selectDissagregationsQuery;

  @Autowired
  SelectTotalDissagregationsQuery selectTotalDissagregationsQuery;

  @Autowired
  UpdateDissagregationQuery updateDissagregationQuery;

  @Autowired
  DeleteDissagregationQuery deleteDissagregationQuery;

  public Mono<Long> insertDissagregation(Dissagregation dissagregation) {
    return insertDissagregationQuery.insertDissagregation(dissagregation);
  }

  public Mono<Dissagregation> selectDissagregation(Long id) {
    return selectDissagregationQuery.selectDissagregation(id);
  }

  public Flux<Dissagregation> selectDissagregations(MultiValueMap<String, String> parameters) {
    return selectDissagregationsQuery.selectDissagregations(parameters);
  }

  public Mono<Long> selectTotalDissagregations(MultiValueMap<String, String> parameters) {
    return selectTotalDissagregationsQuery.selectTotalDissagregations(parameters);
  }

  public Mono<Integer> updateDissagregation(Dissagregation dissagregation) {
    return updateDissagregationQuery.updateDissagregation(dissagregation);
  }

  public Mono<Integer> deleteDissagregationById(Long id) {
    return deleteDissagregationQuery.deleteDissagregation(id);
  }


}

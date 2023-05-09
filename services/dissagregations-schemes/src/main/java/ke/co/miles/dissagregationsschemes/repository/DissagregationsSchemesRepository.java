/*
 * Copyright (C) 2021 Second Mile
 *
 * This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0.
 * If a copy of the MPL was not distributed with this file,
 * You can obtain one at http://mozilla.org/MPL/2.0/.
 */
package ke.co.miles.dissagregationsschemes.repository;


import ke.co.miles.dissagregationsschemes.models.DissagregationScheme;
import ke.co.miles.dissagregationsschemes.repository.deletion.DeleteDissagregationSchemeQuery;
import ke.co.miles.dissagregationsschemes.repository.insertion.InsertDissagregationSchemeQuery;
import ke.co.miles.dissagregationsschemes.repository.selection.SelectDissagregationSchemeQuery;
import ke.co.miles.dissagregationsschemes.repository.selection.SelectDissagregationsSchemesQuery;
import ke.co.miles.dissagregationsschemes.repository.selection.SelectTotalDissagregationsSchemesQuery;
import ke.co.miles.dissagregationsschemes.repository.updation.UpdateDissagregationSchemeQuery;
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
public class DissagregationsSchemesRepository {

  @Autowired
  InsertDissagregationSchemeQuery insertDissagregationSchemeQuery;

  @Autowired
  SelectDissagregationSchemeQuery selectDissagregationSchemeQuery;

  @Autowired
  SelectDissagregationsSchemesQuery selectDissagregationsSchemesQuery;

  @Autowired
  SelectTotalDissagregationsSchemesQuery selectTotalDissagregationsSchemesQuery;

  @Autowired
  UpdateDissagregationSchemeQuery updateDissagregationSchemeQuery;

  @Autowired
  DeleteDissagregationSchemeQuery deleteDissagregationSchemeQuery;

  public Mono<Long> insertDissagregationScheme(DissagregationScheme dissagregationScheme) {
    return insertDissagregationSchemeQuery.insertDissagregationScheme(dissagregationScheme);
  }

  public Mono<DissagregationScheme> selectDissagregationScheme(Long id) {
    return selectDissagregationSchemeQuery.selectDissagregationScheme(id);
  }

  public Flux<DissagregationScheme> selectDissagregationsSchemes(MultiValueMap<String, String> parameters) {
    return selectDissagregationsSchemesQuery.selectDissagregationsSchemes(parameters);
  }

  public Mono<Long> selectTotalDissagregationsSchemes(MultiValueMap<String, String> parameters) {
    return selectTotalDissagregationsSchemesQuery.selectTotalDissagregationsSchemes(parameters);
  }

  public Mono<Integer> updateDissagregationScheme(DissagregationScheme dissagregationScheme) {
    return updateDissagregationSchemeQuery.updateDissagregationScheme(dissagregationScheme);
  }

  public Mono<Integer> deleteDissagregationSchemeById(Long id) {
    return deleteDissagregationSchemeQuery.deleteDissagregationScheme(id);
  }


}

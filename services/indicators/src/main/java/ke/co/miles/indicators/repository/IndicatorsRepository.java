/*
 * Copyright (C) 2021 Second Mile
 *
 * This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0.
 * If a copy of the MPL was not distributed with this file,
 * You can obtain one at http://mozilla.org/MPL/2.0/.
 */
package ke.co.miles.indicators.repository;


import ke.co.miles.indicators.models.Indicator;
import ke.co.miles.indicators.repository.deletion.DeleteIndicatorQuery;
import ke.co.miles.indicators.repository.insertion.InsertIndicatorQuery;
import ke.co.miles.indicators.repository.selection.SelectIndicatorsQuery;
import ke.co.miles.indicators.repository.selection.SelectIndicatorQuery;
import ke.co.miles.indicators.repository.selection.SelectTotalIndicatorsQuery;
import ke.co.miles.indicators.repository.updation.UpdateIndicatorQuery;
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
public class IndicatorsRepository {

  @Autowired
  InsertIndicatorQuery insertIndicatorQuery;

  @Autowired
  SelectIndicatorQuery selectIndicatorQuery;

  @Autowired
  SelectIndicatorsQuery selectIndicatorsQuery;

  @Autowired
  SelectTotalIndicatorsQuery selectTotalIndicatorsQuery;

  @Autowired
  UpdateIndicatorQuery updateIndicatorQuery;

  @Autowired
  DeleteIndicatorQuery deleteIndicatorQuery;

  public Mono<Long> insertIndicator(Indicator indicator) {
    return insertIndicatorQuery.insertIndicator(indicator);
  }

  public Mono<Indicator> selectIndicator(Long id) {
    return selectIndicatorQuery.selectIndicator(id);
  }

  public Flux<Indicator> selectIndicators(MultiValueMap<String, String> parameters) {
    return selectIndicatorsQuery.selectIndicators(parameters);
  }

  public Mono<Long> selectTotalIndicators(MultiValueMap<String, String> parameters) {
    return selectTotalIndicatorsQuery.selectTotalIndicators(parameters);
  }

  public Mono<Integer> updateIndicator(Indicator indicator) {
    return updateIndicatorQuery.updateIndicator(indicator);
  }

  public Mono<Integer> deleteIndicatorById(Long id) {
    return deleteIndicatorQuery.deleteIndicator(id);
  }


}

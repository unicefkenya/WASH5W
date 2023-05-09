/*
 * Copyright (C) 2021 Second Mile
 *
 * This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0.
 * If a copy of the MPL was not distributed with this file,
 * You can obtain one at http://mozilla.org/MPL/2.0/.
 */
package ke.co.miles.operators.repository;


import ke.co.miles.operators.models.Operator;
import ke.co.miles.operators.repository.deletion.DeleteOperatorQuery;
import ke.co.miles.operators.repository.insertion.InsertOperatorQuery;
import ke.co.miles.operators.repository.selection.SelectOperatorsQuery;
import ke.co.miles.operators.repository.selection.SelectOperatorQuery;
import ke.co.miles.operators.repository.selection.SelectTotalOperatorsQuery;
import ke.co.miles.operators.repository.updation.UpdateOperatorQuery;
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
public class OperatorsRepository {

  @Autowired
  InsertOperatorQuery insertOperatorQuery;

  @Autowired
  SelectOperatorQuery selectOperatorQuery;

  @Autowired
  SelectOperatorsQuery selectOperatorsQuery;

  @Autowired
  SelectTotalOperatorsQuery selectTotalOperatorsQuery;

  @Autowired
  UpdateOperatorQuery updateOperatorQuery;

  @Autowired
  DeleteOperatorQuery deleteOperatorQuery;

  public Mono<Long> insertOperator(Operator operator) {
    return insertOperatorQuery.insertOperator(operator);
  }

  public Mono<Operator> selectOperator(Long id) {
    return selectOperatorQuery.selectOperator(id);
  }

  public Flux<Operator> selectOperators(MultiValueMap<String, String> parameters) {
    return selectOperatorsQuery.selectOperators(parameters);
  }

  public Mono<Long> selectTotalOperators(MultiValueMap<String, String> parameters) {
    return selectTotalOperatorsQuery.selectTotalOperators(parameters);
  }

  public Mono<Integer> updateOperator(Operator operator) {
    return updateOperatorQuery.updateOperator(operator);
  }

  public Mono<Integer> deleteOperatorById(Long id) {
    return deleteOperatorQuery.deleteOperator(id);
  }


}

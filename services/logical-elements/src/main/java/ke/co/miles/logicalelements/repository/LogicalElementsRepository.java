/*
 * Copyright (C) 2021 Second Mile
 *
 * This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0.
 * If a copy of the MPL was not distributed with this file,
 * You can obtain one at http://mozilla.org/MPL/2.0/.
 */
package ke.co.miles.logicalelements.repository;


import ke.co.miles.logicalelements.models.LogicalElement;
import ke.co.miles.logicalelements.repository.deletion.DeleteLogicalElementQuery;
import ke.co.miles.logicalelements.repository.insertion.InsertLogicalElementQuery;
import ke.co.miles.logicalelements.repository.selection.SelectLogicalElementQuery;
import ke.co.miles.logicalelements.repository.selection.SelectLogicalElementsQuery;
import ke.co.miles.logicalelements.repository.selection.SelectTotalLogicalElementsQuery;
import ke.co.miles.logicalelements.repository.updation.UpdateLogicalElementQuery;
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
public class LogicalElementsRepository {

  @Autowired
  InsertLogicalElementQuery insertLogicalElementQuery;

  @Autowired
  SelectLogicalElementQuery selectLogicalElementQuery;

  @Autowired
  SelectLogicalElementsQuery selectLogicalElementsQuery;

  @Autowired
  SelectTotalLogicalElementsQuery selectTotalLogicalElementsQuery;

  @Autowired
  UpdateLogicalElementQuery updateLogicalElementQuery;

  @Autowired
  DeleteLogicalElementQuery deleteLogicalElementQuery;

  public Mono<Long> insertLogicalElement(LogicalElement logicalElement) {
    return insertLogicalElementQuery.insertLogicalElement(logicalElement);
  }

  public Mono<LogicalElement> selectLogicalElement(Long id) {
    return selectLogicalElementQuery.selectLogicalElement(id);
  }

  public Flux<LogicalElement> selectLogicalElements(MultiValueMap<String, String> parameters) {
    return selectLogicalElementsQuery.selectLogicalElements(parameters);
  }

  public Mono<Long> selectTotalLogicalElements(MultiValueMap<String, String> parameters) {
    return selectTotalLogicalElementsQuery.selectTotalLogicalElements(parameters);
  }

  public Mono<Integer> updateLogicalElement(LogicalElement logicalElement) {
    return updateLogicalElementQuery.updateLogicalElement(logicalElement);
  }

  public Mono<Integer> deleteLogicalElementById(Long id) {
    return deleteLogicalElementQuery.deleteLogicalElement(id);
  }


}

/*
 * Copyright (C) 2021 Second Mile
 *
 * This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0.
 * If a copy of the MPL was not distributed with this file,
 * You can obtain one at http://mozilla.org/MPL/2.0/.
 */
package ke.co.miles.logicalelementstypes.repository;


import ke.co.miles.logicalelementstypes.models.LogicalElementType;
import ke.co.miles.logicalelementstypes.repository.deletion.DeleteLogicalElementTypeQuery;
import ke.co.miles.logicalelementstypes.repository.insertion.InsertLogicalElementTypeQuery;
import ke.co.miles.logicalelementstypes.repository.selection.SelectLogicalElementTypeQuery;
import ke.co.miles.logicalelementstypes.repository.selection.SelectLogicalElementsTypesQuery;
import ke.co.miles.logicalelementstypes.repository.selection.SelectTotalLogicalElementsTypesQuery;
import ke.co.miles.logicalelementstypes.repository.updation.UpdateLogicalElementTypeQuery;
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
public class LogicalElementsTypesRepository {

  @Autowired
  InsertLogicalElementTypeQuery insertLogicalElementTypeQuery;

  @Autowired
  SelectLogicalElementTypeQuery selectLogicalElementTypeQuery;

  @Autowired
  SelectLogicalElementsTypesQuery selectLogicalElementsTypesQuery;

  @Autowired
  SelectTotalLogicalElementsTypesQuery selectTotalLogicalElementsTypesQuery;

  @Autowired
  UpdateLogicalElementTypeQuery updateLogicalElementTypeQuery;

  @Autowired
  DeleteLogicalElementTypeQuery deleteLogicalElementTypeQuery;

  public Mono<Long> insertLogicalElementType(LogicalElementType logicalElementType) {
    return insertLogicalElementTypeQuery.insertLogicalElementType(logicalElementType);
  }

  public Mono<LogicalElementType> selectLogicalElementType(Long id) {
    return selectLogicalElementTypeQuery.selectLogicalElementType(id);
  }

  public Flux<LogicalElementType> selectLogicalElementsTypes(MultiValueMap<String, String> parameters) {
    return selectLogicalElementsTypesQuery.selectLogicalElementsTypes(parameters);
  }

  public Mono<Long> selectTotalLogicalElementsTypes(MultiValueMap<String, String> parameters) {
    return selectTotalLogicalElementsTypesQuery.selectTotalLogicalElementsTypes(parameters);
  }

  public Mono<Integer> updateLogicalElementType(LogicalElementType logicalElementType) {
    return updateLogicalElementTypeQuery.updateLogicalElementType(logicalElementType);
  }

  public Mono<Integer> deleteLogicalElementTypeById(Long id) {
    return deleteLogicalElementTypeQuery.deleteLogicalElementType(id);
  }


}

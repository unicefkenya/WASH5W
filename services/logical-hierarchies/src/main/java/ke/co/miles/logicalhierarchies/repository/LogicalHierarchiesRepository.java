/*
 * Copyright (C) 2021 Second Mile
 *
 * This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0.
 * If a copy of the MPL was not distributed with this file,
 * You can obtain one at http://mozilla.org/MPL/2.0/.
 */
package ke.co.miles.logicalhierarchies.repository;


import ke.co.miles.logicalhierarchies.models.LogicalHierarchy;
import ke.co.miles.logicalhierarchies.repository.deletion.DeleteLogicalHierarchyQuery;
import ke.co.miles.logicalhierarchies.repository.insertion.InsertLogicalHierarchyQuery;
import ke.co.miles.logicalhierarchies.repository.selection.SelectLogicalHierarchyQuery;
import ke.co.miles.logicalhierarchies.repository.selection.SelectLogicalHierarchiesQuery;
import ke.co.miles.logicalhierarchies.repository.selection.SelectTotalLogicalHierarchiesQuery;
import ke.co.miles.logicalhierarchies.repository.updation.UpdateLogicalHierarchyQuery;
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
public class LogicalHierarchiesRepository {

  @Autowired
  InsertLogicalHierarchyQuery insertLogicalHierarchyQuery;

  @Autowired
  SelectLogicalHierarchyQuery selectLogicalHierarchyQuery;

  @Autowired
  SelectLogicalHierarchiesQuery selectLogicalHierarchiesQuery;

  @Autowired
  SelectTotalLogicalHierarchiesQuery selectTotalLogicalHierarchiesQuery;

  @Autowired
  UpdateLogicalHierarchyQuery updateLogicalHierarchyQuery;

  @Autowired
  DeleteLogicalHierarchyQuery deleteLogicalHierarchyQuery;

  public Mono<Long> insertLogicalHierarchy(LogicalHierarchy logicalHierarchy) {
    return insertLogicalHierarchyQuery.insertLogicalHierarchy(logicalHierarchy);
  }

  public Mono<LogicalHierarchy> selectLogicalHierarchy(Long id) {
    return selectLogicalHierarchyQuery.selectLogicalHierarchy(id);
  }

  public Flux<LogicalHierarchy> selectLogicalHierarchies(MultiValueMap<String, String> parameters) {
    return selectLogicalHierarchiesQuery.selectLogicalHierarchies(parameters);
  }

  public Mono<Long> selectTotalLogicalHierarchies(MultiValueMap<String, String> parameters) {
    return selectTotalLogicalHierarchiesQuery.selectTotalLogicalHierarchies(parameters);
  }

  public Mono<Integer> updateLogicalHierarchy(LogicalHierarchy logicalHierarchy) {
    return updateLogicalHierarchyQuery.updateLogicalHierarchy(logicalHierarchy);
  }

  public Mono<Integer> deleteLogicalHierarchyById(Long id) {
    return deleteLogicalHierarchyQuery.deleteLogicalHierarchy(id);
  }


}

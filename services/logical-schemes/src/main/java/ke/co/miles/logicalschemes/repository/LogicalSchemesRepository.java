/*
 * Copyright (C) 2021 Second Mile
 *
 * This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0.
 * If a copy of the MPL was not distributed with this file,
 * You can obtain one at http://mozilla.org/MPL/2.0/.
 */
package ke.co.miles.logicalschemes.repository;


import ke.co.miles.logicalschemes.models.LogicalScheme;
import ke.co.miles.logicalschemes.repository.deletion.DeleteLogicalSchemeQuery;
import ke.co.miles.logicalschemes.repository.insertion.InsertLogicalSchemeQuery;
import ke.co.miles.logicalschemes.repository.selection.SelectLogicalSchemeQuery;
import ke.co.miles.logicalschemes.repository.selection.SelectLogicalSchemesQuery;
import ke.co.miles.logicalschemes.repository.selection.SelectTotalLogicalSchemesQuery;
import ke.co.miles.logicalschemes.repository.updation.UpdateLogicalSchemeQuery;
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
public class LogicalSchemesRepository {

  @Autowired
  InsertLogicalSchemeQuery insertLogicalSchemeQuery;

  @Autowired
  SelectLogicalSchemeQuery selectLogicalSchemeQuery;

  @Autowired
  SelectLogicalSchemesQuery selectLogicalSchemesQuery;

  @Autowired
  SelectTotalLogicalSchemesQuery selectTotalLogicalSchemesQuery;

  @Autowired
  UpdateLogicalSchemeQuery updateLogicalSchemeQuery;

  @Autowired
  DeleteLogicalSchemeQuery deleteLogicalSchemeQuery;

  public Mono<Long> insertLogicalScheme(LogicalScheme logicalScheme) {
    return insertLogicalSchemeQuery.insertLogicalScheme(logicalScheme);
  }

  public Mono<LogicalScheme> selectLogicalScheme(Long id) {
    return selectLogicalSchemeQuery.selectLogicalScheme(id);
  }

  public Flux<LogicalScheme> selectLogicalSchemes(MultiValueMap<String, String> parameters) {
    return selectLogicalSchemesQuery.selectLogicalSchemes(parameters);
  }

  public Mono<Long> selectTotalLogicalSchemes(MultiValueMap<String, String> parameters) {
    return selectTotalLogicalSchemesQuery.selectTotalLogicalSchemes(parameters);
  }

  public Mono<Integer> updateLogicalScheme(LogicalScheme logicalScheme) {
    return updateLogicalSchemeQuery.updateLogicalScheme(logicalScheme);
  }

  public Mono<Integer> deleteLogicalSchemeById(Long id) {
    return deleteLogicalSchemeQuery.deleteLogicalScheme(id);
  }


}

/*
 * Copyright (C) 2021 Second Mile
 *
 * This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0.
 * If a copy of the MPL was not distributed with this file,
 * You can obtain one at http://mozilla.org/MPL/2.0/.
 */
package ke.co.miles.contexts.repository;


import ke.co.miles.contexts.models.Context;
import ke.co.miles.contexts.repository.deletion.DeleteContextQuery;
import ke.co.miles.contexts.repository.insertion.InsertContextQuery;
import ke.co.miles.contexts.repository.selection.SelectContextsQuery;
import ke.co.miles.contexts.repository.selection.SelectContextQuery;
import ke.co.miles.contexts.repository.selection.SelectTotalContextsQuery;
import ke.co.miles.contexts.repository.updation.UpdateContextQuery;
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
public class ContextsRepository {

  @Autowired
  InsertContextQuery insertContextQuery;

  @Autowired
  SelectContextQuery selectContextQuery;

  @Autowired
  SelectContextsQuery selectContextsQuery;

  @Autowired
  SelectTotalContextsQuery selectTotalContextsQuery;

  @Autowired
  UpdateContextQuery updateContextQuery;

  @Autowired
  DeleteContextQuery deleteContextQuery;

  public Mono<Long> insertContext(Context context) {
    return insertContextQuery.insertContext(context);
  }

  public Mono<Context> selectContext(Long id) {
    return selectContextQuery.selectContext(id);
  }

  public Flux<Context> selectContexts(MultiValueMap<String, String> parameters) {
    return selectContextsQuery.selectContexts(parameters);
  }

  public Mono<Long> selectTotalContexts(MultiValueMap<String, String> parameters) {
    return selectTotalContextsQuery.selectTotalContexts(parameters);
  }

  public Mono<Integer> updateContext(Context context) {
    return updateContextQuery.updateContext(context);
  }

  public Mono<Integer> deleteContextById(Long id) {
    return deleteContextQuery.deleteContext(id);
  }


}

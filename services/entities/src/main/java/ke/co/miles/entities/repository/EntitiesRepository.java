/*
 * Copyright (C) 2021 Second Mile
 *
 * This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0.
 * If a copy of the MPL was not distributed with this file,
 * You can obtain one at http://mozilla.org/MPL/2.0/.
 */
package ke.co.miles.entities.repository;


import ke.co.miles.entities.models.Entity;
import ke.co.miles.entities.repository.deletion.DeleteEntityQuery;
import ke.co.miles.entities.repository.insertion.InsertEntityQuery;
import ke.co.miles.entities.repository.selection.SelectEntitiesQuery;
import ke.co.miles.entities.repository.selection.SelectEntityQuery;
import ke.co.miles.entities.repository.selection.SelectTotalEntitiesQuery;
import ke.co.miles.entities.repository.updation.UpdateEntityQuery;
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
public class EntitiesRepository {

  @Autowired
  InsertEntityQuery insertEntityQuery;

  @Autowired
  SelectEntityQuery selectEntityQuery;

  @Autowired
  SelectEntitiesQuery selectEntitiesQuery;

  @Autowired
  SelectTotalEntitiesQuery selectTotalEntitiesQuery;

  @Autowired
  UpdateEntityQuery updateEntityQuery;

  @Autowired
  DeleteEntityQuery deleteEntityQuery;

  public Mono<Long> insertEntity(String database, Entity entity) {
    return insertEntityQuery.insertEntity(database, entity);
  }

  public Mono<Entity> selectEntity(String database, Long id) {
    return selectEntityQuery.selectEntity(database, id);
  }

  public Flux<Entity> selectEntities(String database, MultiValueMap<String, String> parameters) {
    return selectEntitiesQuery.selectEntities(database, parameters);
  }

  public Mono<Long> selectTotalEntities(String database, MultiValueMap<String, String> parameters) {
    return selectTotalEntitiesQuery.selectTotalEntities(database, parameters);
  }

  public Mono<Integer> updateEntity(String database, Entity entity) {
    return updateEntityQuery.updateEntity(database, entity);
  }

  public Mono<Integer> deleteEntityById(String database, Long id) {
    return deleteEntityQuery.deleteEntity(database, id);
  }


}

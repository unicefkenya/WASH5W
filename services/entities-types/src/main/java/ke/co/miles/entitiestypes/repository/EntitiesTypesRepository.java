/*
 * Copyright (C) 2021 Second Mile
 *
 * This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0.
 * If a copy of the MPL was not distributed with this file,
 * You can obtain one at http://mozilla.org/MPL/2.0/.
 */
package ke.co.miles.entitiestypes.repository;


import ke.co.miles.entitiestypes.models.EntityType;
import ke.co.miles.entitiestypes.repository.deletion.DeleteEntityTypeQuery;
import ke.co.miles.entitiestypes.repository.insertion.InsertEntityTypeQuery;
import ke.co.miles.entitiestypes.repository.selection.SelectEntityTypeQuery;
import ke.co.miles.entitiestypes.repository.selection.SelectEntitiesTypesQuery;
import ke.co.miles.entitiestypes.repository.selection.SelectTotalEntitiesTypesQuery;
import ke.co.miles.entitiestypes.repository.updation.UpdateEntityTypeQuery;
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
public class EntitiesTypesRepository {

  @Autowired
  InsertEntityTypeQuery insertEntityTypeQuery;

  @Autowired
  SelectEntityTypeQuery selectEntityTypeQuery;

  @Autowired
  SelectEntitiesTypesQuery selectEntitiesTypesQuery;

  @Autowired
  SelectTotalEntitiesTypesQuery selectTotalEntitiesTypesQuery;

  @Autowired
  UpdateEntityTypeQuery updateEntityTypeQuery;

  @Autowired
  DeleteEntityTypeQuery deleteEntityTypeQuery;

  public Mono<Long> insertEntityType(EntityType entityType) {
    return insertEntityTypeQuery.insertEntityType(entityType);
  }

  public Mono<EntityType> selectEntityType(Long id) {
    return selectEntityTypeQuery.selectEntityType(id);
  }

  public Flux<EntityType> selectEntitiesTypes(MultiValueMap<String, String> parameters) {
    return selectEntitiesTypesQuery.selectEntitiesTypes(parameters);
  }

  public Mono<Long> selectTotalEntitiesTypes(MultiValueMap<String, String> parameters) {
    return selectTotalEntitiesTypesQuery.selectTotalEntitiesTypes(parameters);
  }

  public Mono<Integer> updateEntityType(EntityType entityType) {
    return updateEntityTypeQuery.updateEntityType(entityType);
  }

  public Mono<Integer> deleteEntityTypeById(Long id) {
    return deleteEntityTypeQuery.deleteEntityType(id);
  }


}

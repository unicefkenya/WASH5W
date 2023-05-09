/*
 * Copyright (C) 2021 Second Mile
 *
 * This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0.
 * If a copy of the MPL was not distributed with this file,
 * You can obtain one at http://mozilla.org/MPL/2.0/.
 */
package ke.co.miles.systemmodules.repository;


import ke.co.miles.systemmodules.models.SystemModule;
import ke.co.miles.systemmodules.repository.deletion.DeleteSystemModuleQuery;
import ke.co.miles.systemmodules.repository.insertion.InsertSystemModuleQuery;
import ke.co.miles.systemmodules.repository.selection.SelectSystemModuleQuery;
import ke.co.miles.systemmodules.repository.selection.SelectSystemsModulesQuery;
import ke.co.miles.systemmodules.repository.selection.SelectTotalSystemsModulesQuery;
import ke.co.miles.systemmodules.repository.updation.UpdateSystemModuleQuery;
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
public class SystemsModulesRepository {

  @Autowired
  InsertSystemModuleQuery insertSystemModuleQuery;

  @Autowired
  SelectSystemModuleQuery selectSystemModuleQuery;

  @Autowired
  SelectSystemsModulesQuery selectSystemsModulesQuery;

  @Autowired
  SelectTotalSystemsModulesQuery selectTotalSystemsModulesQuery;

  @Autowired
  UpdateSystemModuleQuery updateSystemModuleQuery;

  @Autowired
  DeleteSystemModuleQuery deleteSystemModuleQuery;

  public Mono<Long> insertSystemModule(SystemModule systemModule) {
    return insertSystemModuleQuery.insertSystemModule(systemModule);
  }

  public Mono<SystemModule> selectSystemModule(Long id) {
    return selectSystemModuleQuery.selectSystemModule(id);
  }

  public Flux<SystemModule> selectSystemsModules(MultiValueMap<String, String> parameters) {
    return selectSystemsModulesQuery.selectSystemsModules(parameters);
  }

  public Mono<Long> selectTotalSystemsModules(MultiValueMap<String, String> parameters) {
    return selectTotalSystemsModulesQuery.selectTotalSystemsModules(parameters);
  }

  public Mono<Integer> updateSystemModule(SystemModule systemModule) {
    return updateSystemModuleQuery.updateSystemModule(systemModule);
  }

  public Mono<Integer> deleteSystemModuleById(Long id) {
    return deleteSystemModuleQuery.deleteSystemModule(id);
  }


}

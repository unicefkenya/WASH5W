/*
 * Copyright (C) 2021 Second Mile
 *
 * This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0.
 * If a copy of the MPL was not distributed with this file,
 * You can obtain one at http://mozilla.org/MPL/2.0/.
 */
package ke.co.miles.systemsusers.repository;


import ke.co.miles.systemsusers.models.SystemUser;
import ke.co.miles.systemsusers.repository.deletion.DeleteSystemUserQuery;
import ke.co.miles.systemsusers.repository.insertion.InsertSystemUserQuery;
import ke.co.miles.systemsusers.repository.selection.SelectSystemUserQuery;
import ke.co.miles.systemsusers.repository.selection.SelectSystemsUsersQuery;
import ke.co.miles.systemsusers.repository.selection.SelectTotalSystemsUsersQuery;
import ke.co.miles.systemsusers.repository.updation.UpdateSystemUserQuery;
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
public class SystemsUsersRepository {

  @Autowired
  InsertSystemUserQuery insertSystemUserQuery;

  @Autowired
  SelectSystemUserQuery selectSystemUserQuery;

  @Autowired
  SelectSystemsUsersQuery selectSystemsUsersQuery;

  @Autowired
  SelectTotalSystemsUsersQuery selectTotalSystemsUsersQuery;

  @Autowired
  UpdateSystemUserQuery updateSystemUserQuery;

  @Autowired
  DeleteSystemUserQuery deleteSystemUserQuery;

  public Mono<Long> insertSystemUser(SystemUser systemUser) {
    return insertSystemUserQuery.insertSystemUser(systemUser);
  }

  public Mono<SystemUser> selectSystemUser(Long id) {
    return selectSystemUserQuery.selectSystemUser(id);
  }

  public Flux<SystemUser> selectSystemsUsers(MultiValueMap<String, String> parameters) {
    return selectSystemsUsersQuery.selectSystemsUsers(parameters);
  }

  public Mono<Long> selectTotalSystemsUsers(MultiValueMap<String, String> parameters) {
    return selectTotalSystemsUsersQuery.selectTotalSystemsUsers(parameters);
  }

  public Mono<Integer> updateSystemUser(SystemUser systemUser) {
    return updateSystemUserQuery.updateSystemUser(systemUser);
  }

  public Mono<Integer> deleteSystemUserById(Long id) {
    return deleteSystemUserQuery.deleteSystemUser(id);
  }


}

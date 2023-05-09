/*
 * Copyright (C) 2021 Second Mile
 *
 * This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0.
 * If a copy of the MPL was not distributed with this file,
 * You can obtain one at http://mozilla.org/MPL/2.0/.
 */
package ke.co.miles.systemsmodulespermissions.handlers.put;

import ke.co.miles.systemsmodulespermissions.exceptions.ServerException;
import ke.co.miles.systemsmodulespermissions.models.SystemModulePermission;
import ke.co.miles.systemsmodulespermissions.repository.SystemsModulesPermissionsRepository;
import ke.co.miles.systemsmodulespermissions.util.builders.SystemModulePermissionBuilder;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.reactive.function.server.ServerRequest;
import org.springframework.web.reactive.function.server.ServerResponse;
import reactor.core.publisher.Mono;

/**
 * @author Kwaje Anthony <tony@miles.co.ke>
 * @version 1.0
 * @since 1.0
 */
@Component
@Slf4j
public class UpdateSystemModulePermissionHandler {

  @Autowired
  SystemsModulesPermissionsRepository repository;

  /**
   * Updates a systemModulePermission record
   *
   * @param request the request containing the details of the systemModulePermission record to be updated
   * @return the response containing the details of the newly updated systemModulePermission record
   */
  public Mono<ServerResponse> updateSystemModulePermission(ServerRequest request) {

    log.trace("Entering updateSystemModulePermission()");

    return
        ServerResponse
            .status(HttpStatus.OK)
            .contentType(MediaType.APPLICATION_JSON)
            .body(
                request
                    .bodyToMono(SystemModulePermission.class)
                    .flatMap(systemModulePermission ->
                        repository
                            .updateSystemModulePermission(systemModulePermission)
                            .map(count ->
                                new SystemModulePermissionBuilder()
                                    .id(systemModulePermission.getId())
                                    .data(systemModulePermission.getData())
                                    .version(systemModulePermission.getVersion() + 1)
                                    .build())),
                SystemModulePermission.class)
            .onErrorMap(e -> new ServerException("SystemModulePermission update failed", e));

  }

}

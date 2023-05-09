/*
 * Copyright (C) 2021 Second Mile
 *
 * This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0.
 * If a copy of the MPL was not distributed with this file,
 * You can obtain one at http://mozilla.org/MPL/2.0/.
 */
package ke.co.miles.logicalhierarchies.handlers.delete;

import ke.co.miles.logicalhierarchies.exceptions.ServerException;
import ke.co.miles.logicalhierarchies.repository.LogicalHierarchiesRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
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
public class DeleteLogicalHierarchyHandler {

  @Autowired
  LogicalHierarchiesRepository repository;

  /**
   * Deletes a logicalHierarchy record
   *
   * @param request the request containing the details of the logicalHierarchy record to be deleted and the
   *                database from which it should be deleted
   * @return the response containing the number of logicalHierarchies records deleted
   */
  public Mono<ServerResponse> deleteLogicalHierarchy(ServerRequest request) {

    log.trace("Entering deleteLogicalHierarchy()");

    return
        ServerResponse
            .ok()
            .contentType(MediaType.APPLICATION_JSON)
            .body(
                repository
                    .deleteLogicalHierarchyById(Long.parseLong(request.pathVariable("id"))),
                Integer.class)
            .onErrorMap(e -> new ServerException("LogicalHierarchy deletion failed", e));
  }

}

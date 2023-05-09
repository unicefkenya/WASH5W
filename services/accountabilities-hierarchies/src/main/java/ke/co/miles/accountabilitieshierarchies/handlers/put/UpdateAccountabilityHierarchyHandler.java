/*
 * Copyright (C) 2021 Second Mile
 *
 * This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0.
 * If a copy of the MPL was not distributed with this file,
 * You can obtain one at http://mozilla.org/MPL/2.0/.
 */
package ke.co.miles.accountabilitieshierarchies.handlers.put;

import ke.co.miles.accountabilitieshierarchies.exceptions.ServerException;
import ke.co.miles.accountabilitieshierarchies.models.AccountabilityHierarchy;
import ke.co.miles.accountabilitieshierarchies.repository.AccountabilitiesHierarchiesRepository;
import ke.co.miles.accountabilitieshierarchies.util.builders.AccountabilityHierarchyBuilder;
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
public class UpdateAccountabilityHierarchyHandler {

    @Autowired
    AccountabilitiesHierarchiesRepository repository;

    /**
     * Updates an accountability hierarchy record
     *
     * @param request the request containing the details of the accountability hierarchy record to be updated
     * @return the response containing the details of the newly updated accountability hierarchy record
     */
    public Mono<ServerResponse> updateAccountabilityHierarchy(ServerRequest request) {

        log.trace("Entering updateAccountabilityHierarchy()");

        return
                ServerResponse
                        .status(HttpStatus.OK)
                        .contentType(MediaType.APPLICATION_JSON)
                        .body(
                                request
                                        .bodyToMono(AccountabilityHierarchy.class)
                                        .flatMap(accountabilityHierarchy ->
                                                repository
                                                        .updateAccountabilityHierarchy(
                                                                request.pathVariable("database"),
                                                                accountabilityHierarchy)
                                                        .map(count ->
                                                                new AccountabilityHierarchyBuilder()
                                                                        .id(accountabilityHierarchy.getId())
                                                                        .data(accountabilityHierarchy.getData())
                                                                        .version(accountabilityHierarchy.getVersion() + 1)
                                                                        .build())),
                                AccountabilityHierarchy.class)
                        .onErrorMap(e -> new ServerException("Accountability Hierarchy update failed", e));

    }

}

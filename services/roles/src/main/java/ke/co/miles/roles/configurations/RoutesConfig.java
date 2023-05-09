/*
 * Copyright (C) 2021 Second Mile
 *
 * This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0.
 * If a copy of the MPL was not distributed with this file,
 * You can obtain one at http://mozilla.org/MPL/2.0/.
 */
package ke.co.miles.roles.configurations;

import io.swagger.v3.oas.annotations.enums.ParameterIn;
import ke.co.miles.roles.handlers.RolesHandler;
import ke.co.miles.roles.models.Role;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.reactive.function.server.RouterFunction;
import org.springframework.web.reactive.function.server.ServerResponse;

import static org.springdoc.core.fn.builders.apiresponse.Builder.responseBuilder;
import static org.springdoc.core.fn.builders.arrayschema.Builder.arraySchemaBuilder;
import static org.springdoc.core.fn.builders.content.Builder.contentBuilder;
import static org.springdoc.core.fn.builders.parameter.Builder.parameterBuilder;
import static org.springdoc.core.fn.builders.requestbody.Builder.requestBodyBuilder;
import static org.springdoc.core.fn.builders.schema.Builder.schemaBuilder;
import static org.springdoc.webflux.core.fn.SpringdocRouteBuilder.route;
import static org.springframework.http.MediaType.APPLICATION_JSON;
import static org.springframework.web.reactive.function.server.RequestPredicates.accept;
import static org.springframework.web.reactive.function.server.RequestPredicates.contentType;

/**
 * @since 0.0.1
 * @author Kwaje Anthony <tony@miles.co.ke>
 * @version 1.0
 */
@Configuration
public class RoutesConfig {

    @Bean
    RouterFunction<ServerResponse> routeRequests(RolesHandler handler) {

        return
                route()
                        .POST("/api/v1/roles/{database}",
                                accept(APPLICATION_JSON).and(contentType(APPLICATION_JSON)),
                                handler::createRole,
                                ops -> ops
                                        .tag("Create")
                                        .operationId("createRole")
                                        .beanClass(RolesHandler.class)
                                        .beanMethod("createRole")
                                        .description("Inserts a single role record into the database")
                                        .parameter(
                                                parameterBuilder()
                                                        .name("database").in(ParameterIn.PATH)
                                                        .description("The name of the database within which the role record should be inserted")
                                                        .implementation(String.class))
                                        .requestBody(
                                                requestBodyBuilder()
                                                        .content(contentBuilder()
                                                                .schema(schemaBuilder()
                                                                        .implementation(Role.class))))
                                        .response(
                                                responseBuilder()
                                                        .responseCode("201").description("The role record was successfully created")
                                                        .implementation(Role.class))
                                        .response(
                                                responseBuilder()
                                                        .responseCode("500").description("An unexpected condition was encountered while creating the role record")
                                                        .implementation(String.class)))
                        .build()

                        .and(route()
                                .POST("/api/v1/roles/{database}/all",
                                        accept(APPLICATION_JSON).and(contentType(APPLICATION_JSON)),
                                        handler::createRoles,
                                        ops -> ops
                                                .tag("Create")
                                                .operationId("createRoles")
                                                .beanClass(RolesHandler.class)
                                                .beanMethod("createRoles")
                                                .description("Inserts several role records into the database")
                                                .parameter(
                                                        parameterBuilder()
                                                                .name("database").in(ParameterIn.PATH)
                                                                .description("The name of the database within which the role records should be inserted")
                                                                .implementation(String.class))
                                                .requestBody(
                                                        requestBodyBuilder()
                                                                .content(contentBuilder()
                                                                        .array(arraySchemaBuilder()
                                                                                .schema(schemaBuilder()
                                                                                        .implementation(Role.class)))))

                                                .response(
                                                        responseBuilder()
                                                                .responseCode("201").description("The role records were successfully created")
                                                                .implementationArray(Role.class))

                                                .response(
                                                        responseBuilder()
                                                                .responseCode("500").description("An unexpected condition was encountered while creating the role records")
                                                                .implementation(String.class)))
                                .build()

                                .and(route()
                                        .GET("/api/v1/roles/{database}/ids/{id}",
                                                accept(APPLICATION_JSON),
                                                handler::retrieveRole,
                                                ops -> ops
                                                        .tag("Retrieve")
                                                        .operationId("retrieveRole")
                                                        .beanClass(RolesHandler.class)
                                                        .beanMethod("retrieveRole")
                                                        .description("Retrieves a single role record from the database given its unique identifier")
                                                        .parameter(
                                                                parameterBuilder()
                                                                        .name("database").in(ParameterIn.PATH)
                                                                        .description("The name of the database from which the role record should be retrieved")
                                                                        .implementation(String.class))
                                                        .parameter(
                                                                parameterBuilder()
                                                                        .name("id").in(ParameterIn.PATH)
                                                                        .description("The unique identifier of the role record that should be retrieved")
                                                                        .implementation(Long.class))
                                                        .response(
                                                                responseBuilder()
                                                                        .responseCode("200").description("The role record was successfully retrieved")
                                                                        .implementation(Role.class))
                                                        .response(
                                                                responseBuilder()
                                                                        .responseCode("500").description("An unexpected condition was encountered while retrieving the role record")
                                                                        .implementation(String.class)))
                                        .build())

                                .and(route()
                                        .GET("/api/v1/roles/{database}/all",
                                                accept(APPLICATION_JSON),
                                                handler::retrieveRoles,
                                                ops -> ops
                                                        .tag("Retrieve")
                                                        .operationId("retrieveRoles")
                                                        .beanClass(RolesHandler.class)
                                                        .beanMethod("retrieveRoles")
                                                        .description("Retrieves all or some of the role records from the database depending on whether query parameters were included in the query string")
                                                        .parameter(
                                                                parameterBuilder()
                                                                        .name("database").in(ParameterIn.PATH)
                                                                        .description("The name of the database from which the role records should be retrieved")
                                                                        .implementation(String.class))
                                                        .parameter(
                                                                parameterBuilder()
                                                                        .name("ids").in(ParameterIn.QUERY)
                                                                        .description("The unique identifiers of the role records that should be retrieved")
                                                                        .implementation(Long.class))
                                                        .parameter(
                                                                parameterBuilder()
                                                                        .name("limit").in(ParameterIn.QUERY)
                                                                        .description("The maximum number of Data Type Records to return")
                                                                        .implementation(Integer.class))
                                                        .parameter(
                                                                parameterBuilder()
                                                                        .name("offset").in(ParameterIn.QUERY)
                                                                        .description("The starting point from which Data Type Records should be returned")
                                                                        .implementation(Integer.class))
                                                        .response(
                                                                responseBuilder()
                                                                        .responseCode("200").description("The role records were successfully retrieved")
                                                                        .implementationArray(Role.class))
                                                        .response(
                                                                responseBuilder()
                                                                        .responseCode("500").description("An unexpected condition was encountered while retrieving the role records")
                                                                        .implementation(String.class)))
                                        .build())
                                .and(route()
                                        .GET("/api/v1/roles/{database}/total",
                                                accept(APPLICATION_JSON),
                                                handler::retrieveTotalRoles,
                                                ops -> ops
                                                        .tag("Retrieve")
                                                        .operationId("retrieveTotalRoles")
                                                        .beanClass(RolesHandler.class)
                                                        .beanMethod("retrieveTotalRoles")
                                                        .description("Retrieves the estimated or actual count of role records from the database given a specific query and its parameters")
                                                        .parameter(
                                                                parameterBuilder()
                                                                        .name("database").in(ParameterIn.PATH)
                                                                        .description("The name of the database from which the role records count should be made")
                                                                        .implementation(String.class))
                                                        .parameter(
                                                                parameterBuilder()
                                                                        .name("ids").in(ParameterIn.QUERY)
                                                                        .description("The unique identifiers of the role records that should be included in the count")
                                                                        .implementation(Long.class))
                                                        .response(
                                                                responseBuilder()
                                                                        .responseCode("200").description("The role records were successfully retrieved")
                                                                        .implementationArray(Role.class))
                                                        .response(
                                                                responseBuilder()
                                                                        .responseCode("500").description("An unexpected condition was encountered while retrieving the role records")
                                                                        .implementation(String.class)))
                                        .build())

                                .and(route()
                                        .PUT("/api/v1/roles/{database}",
                                                accept(APPLICATION_JSON).and(contentType(APPLICATION_JSON)),
                                                handler::updateRole,
                                                ops -> ops
                                                        .tag("Update")
                                                        .operationId("updateRole")
                                                        .beanClass(RolesHandler.class)
                                                        .beanMethod("updateRole")
                                                        .description("Updates a single role record in the database")
                                                        .parameter(
                                                                parameterBuilder()
                                                                        .name("database").in(ParameterIn.PATH)
                                                                        .description("The name of the database within which the role record should be updated")
                                                                        .implementation(String.class))
                                                        .response(
                                                                responseBuilder()
                                                                        .responseCode("200").description("The role record was successfully updated")
                                                                        .implementation(Role.class))
                                                        .response(
                                                                responseBuilder()
                                                                        .responseCode("500").description("An unexpected condition was encountered while updating the role record")
                                                                        .implementation(String.class)))
                                        .build())

                                .and(route()
                                        .PUT("/api/v1/roles/{database}/all",
                                                accept(APPLICATION_JSON).and(contentType(APPLICATION_JSON)),
                                                handler::updateRoles,
                                                ops -> ops
                                                        .tag("Update")
                                                        .operationId("updateRole")
                                                        .beanClass(RolesHandler.class)
                                                        .beanMethod("updateRoles")
                                                        .description("Updates several role records in the database")
                                                        .parameter(
                                                                parameterBuilder()
                                                                        .name("database").in(ParameterIn.PATH)
                                                                        .description("The name of the database within which the role records should be updated")
                                                                        .implementation(String.class))
                                                        .requestBody(
                                                                requestBodyBuilder()
                                                                        .content(contentBuilder()
                                                                                .array(arraySchemaBuilder()
                                                                                        .schema(schemaBuilder()
                                                                                                .implementation(Role.class)))))
                                                        .response(
                                                                responseBuilder()
                                                                        .responseCode("200").description("The role records were successfully updated")
                                                                        .implementation(Role.class))
                                                        .response(
                                                                responseBuilder()
                                                                        .responseCode("500").description("An unexpected condition was encountered while updating the role records")
                                                                        .implementation(String.class)))
                                        .build())

                                .and(route()
                                        .DELETE("/api/v1/roles/{database}/ids/{id}",
                                                accept(APPLICATION_JSON),
                                                handler::deleteRole,
                                                ops -> ops
                                                        .tag("Delete")
                                                        .operationId("deleteRole")
                                                        .beanClass(RolesHandler.class)
                                                        .beanMethod("deleteRole")
                                                        .description("Deletes a single role record from the database given its unique identifier")
                                                        .parameter(
                                                                parameterBuilder()
                                                                        .name("database").in(ParameterIn.PATH)
                                                                        .description("The name of the database from which the role record should be deleted")
                                                                        .implementation(String.class))
                                                        .parameter(
                                                                parameterBuilder()
                                                                        .name("id").in(ParameterIn.PATH)
                                                                        .description("The unique identifier of the desired role record")
                                                                        .implementation(Long.class))
                                                        .response(
                                                                responseBuilder()
                                                                        .responseCode("200").description("The role record was successfully deleted")
                                                                        .implementation(Integer.class)
                                                                        .description("The number of role records successfully deleted"))
                                                        .response(
                                                                responseBuilder()
                                                                        .responseCode("500").description("An unexpected condition was encountered while deleting the role record")
                                                                        .implementation(String.class)))
                                        .build())

                                .and(route()
                                        .DELETE("/api/v1/roles/{database}/all",
                                                accept(APPLICATION_JSON),
                                                handler::deleteRoles,
                                                ops -> ops
                                                        .tag("Delete")
                                                        .operationId("deleteRoles")
                                                        .beanClass(RolesHandler.class)
                                                        .beanMethod("deleteRoles")
                                                        .description("Deletes all or some of the role records from the database depending on whether or not query parameters were included in the query string")
                                                        .parameter(
                                                                parameterBuilder()
                                                                        .name("database").in(ParameterIn.PATH)
                                                                        .description("The name of the database from which the role records should be deleted")
                                                                        .implementation(String.class))
                                                        .parameter(
                                                                parameterBuilder()
                                                                        .name("ids").in(ParameterIn.QUERY)
                                                                        .description("The unique identifiers of the role records that should be included in the deletion")
                                                                        .implementation(Long.class))
                                                        .response(
                                                                responseBuilder()
                                                                        .responseCode("200").description("The role records were successfully deleted")
                                                                        .implementation(Integer.class)
                                                                        .description("The number of role records successfully deleted"))
                                                        .response(
                                                                responseBuilder()
                                                                        .responseCode("500").description("An unexpected condition was encountered while deleting the role records")
                                                                        .implementation(String.class)))
                                        .build()));
    }

}
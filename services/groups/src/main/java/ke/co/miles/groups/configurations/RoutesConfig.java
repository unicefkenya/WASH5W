/*
 * Copyright (C) 2021 Second Mile
 *
 * This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0.
 * If a copy of the MPL was not distributed with this file,
 * You can obtain one at http://mozilla.org/MPL/2.0/.
 */
package ke.co.miles.groups.configurations;

import io.swagger.v3.oas.annotations.enums.ParameterIn;
import ke.co.miles.groups.handlers.GroupsHandler;
import ke.co.miles.groups.models.Group;
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
    RouterFunction<ServerResponse> routeRequests(GroupsHandler handler) {

        return
                route()
                        .POST("/api/v1/groups/{database}",
                                accept(APPLICATION_JSON).and(contentType(APPLICATION_JSON)),
                                handler::createGroup,
                                ops -> ops
                                        .tag("Create")
                                        .operationId("createGroup")
                                        .beanClass(GroupsHandler.class)
                                        .beanMethod("createGroup")
                                        .description("Inserts a single group record into the database")
                                        .parameter(
                                                parameterBuilder()
                                                        .name("database").in(ParameterIn.PATH)
                                                        .description("The name of the database within which the group record should be inserted")
                                                        .implementation(String.class))
                                        .requestBody(
                                                requestBodyBuilder()
                                                        .content(contentBuilder()
                                                                .schema(schemaBuilder()
                                                                        .implementation(Group.class))))
                                        .response(
                                                responseBuilder()
                                                        .responseCode("201").description("The group record was successfully created")
                                                        .implementation(Group.class))
                                        .response(
                                                responseBuilder()
                                                        .responseCode("500").description("An unexpected condition was encountered while creating the group record")
                                                        .implementation(String.class)))
                        .build()

                        .and(route()
                                .POST("/api/v1/groups/{database}/all",
                                        accept(APPLICATION_JSON).and(contentType(APPLICATION_JSON)),
                                        handler::createGroups,
                                        ops -> ops
                                                .tag("Create")
                                                .operationId("createGroups")
                                                .beanClass(GroupsHandler.class)
                                                .beanMethod("createGroups")
                                                .description("Inserts several group records into the database")
                                                .parameter(
                                                        parameterBuilder()
                                                                .name("database").in(ParameterIn.PATH)
                                                                .description("The name of the database within which the group records should be inserted")
                                                                .implementation(String.class))
                                                .requestBody(
                                                        requestBodyBuilder()
                                                                .content(contentBuilder()
                                                                        .array(arraySchemaBuilder()
                                                                                .schema(schemaBuilder()
                                                                                        .implementation(Group.class)))))

                                                .response(
                                                        responseBuilder()
                                                                .responseCode("201").description("The group records were successfully created")
                                                                .implementationArray(Group.class))

                                                .response(
                                                        responseBuilder()
                                                                .responseCode("500").description("An unexpected condition was encountered while creating the group records")
                                                                .implementation(String.class)))
                                .build()

                                .and(route()
                                        .GET("/api/v1/groups/{database}/ids/{id}",
                                                accept(APPLICATION_JSON),
                                                handler::retrieveGroup,
                                                ops -> ops
                                                        .tag("Retrieve")
                                                        .operationId("retrieveGroup")
                                                        .beanClass(GroupsHandler.class)
                                                        .beanMethod("retrieveGroup")
                                                        .description("Retrieves a single group record from the database given its unique identifier")
                                                        .parameter(
                                                                parameterBuilder()
                                                                        .name("database").in(ParameterIn.PATH)
                                                                        .description("The name of the database from which the group record should be retrieved")
                                                                        .implementation(String.class))
                                                        .parameter(
                                                                parameterBuilder()
                                                                        .name("id").in(ParameterIn.PATH)
                                                                        .description("The unique identifier of the group record that should be retrieved")
                                                                        .implementation(Long.class))
                                                        .response(
                                                                responseBuilder()
                                                                        .responseCode("200").description("The group record was successfully retrieved")
                                                                        .implementation(Group.class))
                                                        .response(
                                                                responseBuilder()
                                                                        .responseCode("500").description("An unexpected condition was encountered while retrieving the group record")
                                                                        .implementation(String.class)))
                                        .build())

                                .and(route()
                                        .GET("/api/v1/groups/{database}/all",
                                                accept(APPLICATION_JSON),
                                                handler::retrieveGroups,
                                                ops -> ops
                                                        .tag("Retrieve")
                                                        .operationId("retrieveGroups")
                                                        .beanClass(GroupsHandler.class)
                                                        .beanMethod("retrieveGroups")
                                                        .description("Retrieves all or some of the group records from the database depending on whether query parameters were included in the query string")
                                                        .parameter(
                                                                parameterBuilder()
                                                                        .name("database").in(ParameterIn.PATH)
                                                                        .description("The name of the database from which the group records should be retrieved")
                                                                        .implementation(String.class))
                                                        .parameter(
                                                                parameterBuilder()
                                                                        .name("ids").in(ParameterIn.QUERY)
                                                                        .description("The unique identifiers of the group records that should be retrieved")
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
                                                                        .responseCode("200").description("The group records were successfully retrieved")
                                                                        .implementationArray(Group.class))
                                                        .response(
                                                                responseBuilder()
                                                                        .responseCode("500").description("An unexpected condition was encountered while retrieving the group records")
                                                                        .implementation(String.class)))
                                        .build())
                                .and(route()
                                        .GET("/api/v1/groups/{database}/total",
                                                accept(APPLICATION_JSON),
                                                handler::retrieveTotalGroups,
                                                ops -> ops
                                                        .tag("Retrieve")
                                                        .operationId("retrieveTotalGroups")
                                                        .beanClass(GroupsHandler.class)
                                                        .beanMethod("retrieveTotalGroups")
                                                        .description("Retrieves the estimated or actual count of group records from the database given a specific query and its parameters")
                                                        .parameter(
                                                                parameterBuilder()
                                                                        .name("database").in(ParameterIn.PATH)
                                                                        .description("The name of the database from which the group records count should be made")
                                                                        .implementation(String.class))
                                                        .parameter(
                                                                parameterBuilder()
                                                                        .name("ids").in(ParameterIn.QUERY)
                                                                        .description("The unique identifiers of the group records that should be included in the count")
                                                                        .implementation(Long.class))
                                                        .response(
                                                                responseBuilder()
                                                                        .responseCode("200").description("The group records were successfully retrieved")
                                                                        .implementationArray(Group.class))
                                                        .response(
                                                                responseBuilder()
                                                                        .responseCode("500").description("An unexpected condition was encountered while retrieving the group records")
                                                                        .implementation(String.class)))
                                        .build())

                                .and(route()
                                        .PUT("/api/v1/groups/{database}",
                                                accept(APPLICATION_JSON).and(contentType(APPLICATION_JSON)),
                                                handler::updateGroup,
                                                ops -> ops
                                                        .tag("Update")
                                                        .operationId("updateGroup")
                                                        .beanClass(GroupsHandler.class)
                                                        .beanMethod("updateGroup")
                                                        .description("Updates a single group record in the database")
                                                        .parameter(
                                                                parameterBuilder()
                                                                        .name("database").in(ParameterIn.PATH)
                                                                        .description("The name of the database within which the group record should be updated")
                                                                        .implementation(String.class))
                                                        .response(
                                                                responseBuilder()
                                                                        .responseCode("200").description("The group record was successfully updated")
                                                                        .implementation(Group.class))
                                                        .response(
                                                                responseBuilder()
                                                                        .responseCode("500").description("An unexpected condition was encountered while updating the group record")
                                                                        .implementation(String.class)))
                                        .build())

                                .and(route()
                                        .PUT("/api/v1/groups/{database}/all",
                                                accept(APPLICATION_JSON).and(contentType(APPLICATION_JSON)),
                                                handler::updateGroups,
                                                ops -> ops
                                                        .tag("Update")
                                                        .operationId("updateGroup")
                                                        .beanClass(GroupsHandler.class)
                                                        .beanMethod("updateGroups")
                                                        .description("Updates several group records in the database")
                                                        .parameter(
                                                                parameterBuilder()
                                                                        .name("database").in(ParameterIn.PATH)
                                                                        .description("The name of the database within which the group records should be updated")
                                                                        .implementation(String.class))
                                                        .requestBody(
                                                                requestBodyBuilder()
                                                                        .content(contentBuilder()
                                                                                .array(arraySchemaBuilder()
                                                                                        .schema(schemaBuilder()
                                                                                                .implementation(Group.class)))))
                                                        .response(
                                                                responseBuilder()
                                                                        .responseCode("200").description("The group records were successfully updated")
                                                                        .implementation(Group.class))
                                                        .response(
                                                                responseBuilder()
                                                                        .responseCode("500").description("An unexpected condition was encountered while updating the group records")
                                                                        .implementation(String.class)))
                                        .build())

                                .and(route()
                                        .DELETE("/api/v1/groups/{database}/ids/{id}",
                                                accept(APPLICATION_JSON),
                                                handler::deleteGroup,
                                                ops -> ops
                                                        .tag("Delete")
                                                        .operationId("deleteGroup")
                                                        .beanClass(GroupsHandler.class)
                                                        .beanMethod("deleteGroup")
                                                        .description("Deletes a single group record from the database given its unique identifier")
                                                        .parameter(
                                                                parameterBuilder()
                                                                        .name("database").in(ParameterIn.PATH)
                                                                        .description("The name of the database from which the group record should be deleted")
                                                                        .implementation(String.class))
                                                        .parameter(
                                                                parameterBuilder()
                                                                        .name("id").in(ParameterIn.PATH)
                                                                        .description("The unique identifier of the desired group record")
                                                                        .implementation(Long.class))
                                                        .response(
                                                                responseBuilder()
                                                                        .responseCode("200").description("The group record was successfully deleted")
                                                                        .implementation(Integer.class)
                                                                        .description("The number of group records successfully deleted"))
                                                        .response(
                                                                responseBuilder()
                                                                        .responseCode("500").description("An unexpected condition was encountered while deleting the group record")
                                                                        .implementation(String.class)))
                                        .build())

                                .and(route()
                                        .DELETE("/api/v1/groups/{database}/all",
                                                accept(APPLICATION_JSON),
                                                handler::deleteGroups,
                                                ops -> ops
                                                        .tag("Delete")
                                                        .operationId("deleteGroups")
                                                        .beanClass(GroupsHandler.class)
                                                        .beanMethod("deleteGroups")
                                                        .description("Deletes all or some of the group records from the database depending on whether or not query parameters were included in the query string")
                                                        .parameter(
                                                                parameterBuilder()
                                                                        .name("database").in(ParameterIn.PATH)
                                                                        .description("The name of the database from which the group records should be deleted")
                                                                        .implementation(String.class))
                                                        .parameter(
                                                                parameterBuilder()
                                                                        .name("ids").in(ParameterIn.QUERY)
                                                                        .description("The unique identifiers of the group records that should be included in the deletion")
                                                                        .implementation(Long.class))
                                                        .response(
                                                                responseBuilder()
                                                                        .responseCode("200").description("The group records were successfully deleted")
                                                                        .implementation(Integer.class)
                                                                        .description("The number of group records successfully deleted"))
                                                        .response(
                                                                responseBuilder()
                                                                        .responseCode("500").description("An unexpected condition was encountered while deleting the group records")
                                                                        .implementation(String.class)))
                                        .build()));
    }

}
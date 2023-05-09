/*
 * Copyright (C) 2021 Second Mile
 *
 * This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0.
 * If a copy of the MPL was not distributed with this file,
 * You can obtain one at http://mozilla.org/MPL/2.0/.
 */
package ke.co.miles.statuses.configurations;

import io.swagger.v3.oas.annotations.enums.ParameterIn;
import ke.co.miles.statuses.handlers.StatusesHandler;
import ke.co.miles.statuses.models.Status;
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
    RouterFunction<ServerResponse> routeRequests(StatusesHandler handler) {

        return
                route()
                        .POST("/api/v1/statuses/{database}",
                                accept(APPLICATION_JSON).and(contentType(APPLICATION_JSON)),
                                handler::createStatus,
                                ops -> ops
                                        .tag("Create")
                                        .operationId("createStatus")
                                        .beanClass(StatusesHandler.class)
                                        .beanMethod("createStatus")
                                        .description("Inserts a single status record into the database")
                                        .parameter(
                                                parameterBuilder()
                                                        .name("database").in(ParameterIn.PATH)
                                                        .description("The name of the database within which the status record should be inserted")
                                                        .implementation(String.class))
                                        .requestBody(
                                                requestBodyBuilder()
                                                        .content(contentBuilder()
                                                                .schema(schemaBuilder()
                                                                        .implementation(Status.class))))
                                        .response(
                                                responseBuilder()
                                                        .responseCode("201").description("The status record was successfully created")
                                                        .implementation(Status.class))
                                        .response(
                                                responseBuilder()
                                                        .responseCode("500").description("An unexpected condition was encountered while creating the status record")
                                                        .implementation(String.class)))
                        .build()

                        .and(route()
                                .POST("/api/v1/statuses/{database}/all",
                                        accept(APPLICATION_JSON).and(contentType(APPLICATION_JSON)),
                                        handler::createStatuses,
                                        ops -> ops
                                                .tag("Create")
                                                .operationId("createStatuses")
                                                .beanClass(StatusesHandler.class)
                                                .beanMethod("createStatuses")
                                                .description("Inserts several status records into the database")
                                                .parameter(
                                                        parameterBuilder()
                                                                .name("database").in(ParameterIn.PATH)
                                                                .description("The name of the database within which the status records should be inserted")
                                                                .implementation(String.class))
                                                .requestBody(
                                                        requestBodyBuilder()
                                                                .content(contentBuilder()
                                                                        .array(arraySchemaBuilder()
                                                                                .schema(schemaBuilder()
                                                                                        .implementation(Status.class)))))

                                                .response(
                                                        responseBuilder()
                                                                .responseCode("201").description("The status records were successfully created")
                                                                .implementationArray(Status.class))

                                                .response(
                                                        responseBuilder()
                                                                .responseCode("500").description("An unexpected condition was encountered while creating the status records")
                                                                .implementation(String.class)))
                                .build()

                                .and(route()
                                        .GET("/api/v1/statuses/{database}/ids/{id}",
                                                accept(APPLICATION_JSON),
                                                handler::retrieveStatus,
                                                ops -> ops
                                                        .tag("Retrieve")
                                                        .operationId("retrieveStatus")
                                                        .beanClass(StatusesHandler.class)
                                                        .beanMethod("retrieveStatus")
                                                        .description("Retrieves a single status record from the database given its unique identifier")
                                                        .parameter(
                                                                parameterBuilder()
                                                                        .name("database").in(ParameterIn.PATH)
                                                                        .description("The name of the database from which the status record should be retrieved")
                                                                        .implementation(String.class))
                                                        .parameter(
                                                                parameterBuilder()
                                                                        .name("id").in(ParameterIn.PATH)
                                                                        .description("The unique identifier of the status record that should be retrieved")
                                                                        .implementation(Long.class))
                                                        .response(
                                                                responseBuilder()
                                                                        .responseCode("200").description("The status record was successfully retrieved")
                                                                        .implementation(Status.class))
                                                        .response(
                                                                responseBuilder()
                                                                        .responseCode("500").description("An unexpected condition was encountered while retrieving the status record")
                                                                        .implementation(String.class)))
                                        .build())

                                .and(route()
                                        .GET("/api/v1/statuses/{database}/all",
                                                accept(APPLICATION_JSON),
                                                handler::retrieveStatuses,
                                                ops -> ops
                                                        .tag("Retrieve")
                                                        .operationId("retrieveStatuses")
                                                        .beanClass(StatusesHandler.class)
                                                        .beanMethod("retrieveStatuses")
                                                        .description("Retrieves all or some of the status records from the database depending on whether query parameters were included in the query string")
                                                        .parameter(
                                                                parameterBuilder()
                                                                        .name("database").in(ParameterIn.PATH)
                                                                        .description("The name of the database from which the status records should be retrieved")
                                                                        .implementation(String.class))
                                                        .parameter(
                                                                parameterBuilder()
                                                                        .name("ids").in(ParameterIn.QUERY)
                                                                        .description("The unique identifiers of the status records that should be retrieved")
                                                                        .implementation(Long.class))
                                                        .parameter(
                                                                parameterBuilder()
                                                                        .name("limit").in(ParameterIn.QUERY)
                                                                        .description("The maximum number of Data Status Records to return")
                                                                        .implementation(Integer.class))
                                                        .parameter(
                                                                parameterBuilder()
                                                                        .name("offset").in(ParameterIn.QUERY)
                                                                        .description("The starting point from which Data Status Records should be returned")
                                                                        .implementation(Integer.class))
                                                        .response(
                                                                responseBuilder()
                                                                        .responseCode("200").description("The status records were successfully retrieved")
                                                                        .implementationArray(Status.class))
                                                        .response(
                                                                responseBuilder()
                                                                        .responseCode("500").description("An unexpected condition was encountered while retrieving the status records")
                                                                        .implementation(String.class)))
                                        .build())
                                .and(route()
                                        .GET("/api/v1/statuses/{database}/total",
                                                accept(APPLICATION_JSON),
                                                handler::retrieveTotalStatuses,
                                                ops -> ops
                                                        .tag("Retrieve")
                                                        .operationId("retrieveTotalStatuses")
                                                        .beanClass(StatusesHandler.class)
                                                        .beanMethod("retrieveTotalStatuses")
                                                        .description("Retrieves the estimated or actual count of status records from the database given a specific query and its parameters")
                                                        .parameter(
                                                                parameterBuilder()
                                                                        .name("database").in(ParameterIn.PATH)
                                                                        .description("The name of the database from which the status records count should be made")
                                                                        .implementation(String.class))
                                                        .parameter(
                                                                parameterBuilder()
                                                                        .name("ids").in(ParameterIn.QUERY)
                                                                        .description("The unique identifiers of the status records that should be included in the count")
                                                                        .implementation(Long.class))
                                                        .response(
                                                                responseBuilder()
                                                                        .responseCode("200").description("The status records were successfully retrieved")
                                                                        .implementationArray(Status.class))
                                                        .response(
                                                                responseBuilder()
                                                                        .responseCode("500").description("An unexpected condition was encountered while retrieving the status records")
                                                                        .implementation(String.class)))
                                        .build())

                                .and(route()
                                        .PUT("/api/v1/statuses/{database}",
                                                accept(APPLICATION_JSON).and(contentType(APPLICATION_JSON)),
                                                handler::updateStatus,
                                                ops -> ops
                                                        .tag("Update")
                                                        .operationId("updateStatus")
                                                        .beanClass(StatusesHandler.class)
                                                        .beanMethod("updateStatus")
                                                        .description("Updates a single status record in the database")
                                                        .parameter(
                                                                parameterBuilder()
                                                                        .name("database").in(ParameterIn.PATH)
                                                                        .description("The name of the database within which the status record should be updated")
                                                                        .implementation(String.class))
                                                        .response(
                                                                responseBuilder()
                                                                        .responseCode("200").description("The status record was successfully updated")
                                                                        .implementation(Status.class))
                                                        .response(
                                                                responseBuilder()
                                                                        .responseCode("500").description("An unexpected condition was encountered while updating the status record")
                                                                        .implementation(String.class)))
                                        .build())

                                .and(route()
                                        .PUT("/api/v1/statuses/{database}/all",
                                                accept(APPLICATION_JSON).and(contentType(APPLICATION_JSON)),
                                                handler::updateStatuses,
                                                ops -> ops
                                                        .tag("Update")
                                                        .operationId("updateStatus")
                                                        .beanClass(StatusesHandler.class)
                                                        .beanMethod("updateStatuses")
                                                        .description("Updates several status records in the database")
                                                        .parameter(
                                                                parameterBuilder()
                                                                        .name("database").in(ParameterIn.PATH)
                                                                        .description("The name of the database within which the status records should be updated")
                                                                        .implementation(String.class))
                                                        .requestBody(
                                                                requestBodyBuilder()
                                                                        .content(contentBuilder()
                                                                                .array(arraySchemaBuilder()
                                                                                        .schema(schemaBuilder()
                                                                                                .implementation(Status.class)))))
                                                        .response(
                                                                responseBuilder()
                                                                        .responseCode("200").description("The status records were successfully updated")
                                                                        .implementation(Status.class))
                                                        .response(
                                                                responseBuilder()
                                                                        .responseCode("500").description("An unexpected condition was encountered while updating the status records")
                                                                        .implementation(String.class)))
                                        .build())

                                .and(route()
                                        .DELETE("/api/v1/statuses/{database}/ids/{id}",
                                                accept(APPLICATION_JSON),
                                                handler::deleteStatus,
                                                ops -> ops
                                                        .tag("Delete")
                                                        .operationId("deleteStatus")
                                                        .beanClass(StatusesHandler.class)
                                                        .beanMethod("deleteStatus")
                                                        .description("Deletes a single status record from the database given its unique identifier")
                                                        .parameter(
                                                                parameterBuilder()
                                                                        .name("database").in(ParameterIn.PATH)
                                                                        .description("The name of the database from which the status record should be deleted")
                                                                        .implementation(String.class))
                                                        .parameter(
                                                                parameterBuilder()
                                                                        .name("id").in(ParameterIn.PATH)
                                                                        .description("The unique identifier of the desired status record")
                                                                        .implementation(Long.class))
                                                        .response(
                                                                responseBuilder()
                                                                        .responseCode("200").description("The status record was successfully deleted")
                                                                        .implementation(Integer.class)
                                                                        .description("The number of status records successfully deleted"))
                                                        .response(
                                                                responseBuilder()
                                                                        .responseCode("500").description("An unexpected condition was encountered while deleting the status record")
                                                                        .implementation(String.class)))
                                        .build())

                                .and(route()
                                        .DELETE("/api/v1/statuses/{database}/all",
                                                accept(APPLICATION_JSON),
                                                handler::deleteStatuses,
                                                ops -> ops
                                                        .tag("Delete")
                                                        .operationId("deleteStatuses")
                                                        .beanClass(StatusesHandler.class)
                                                        .beanMethod("deleteStatuses")
                                                        .description("Deletes all or some of the status records from the database depending on whether or not query parameters were included in the query string")
                                                        .parameter(
                                                                parameterBuilder()
                                                                        .name("database").in(ParameterIn.PATH)
                                                                        .description("The name of the database from which the status records should be deleted")
                                                                        .implementation(String.class))
                                                        .parameter(
                                                                parameterBuilder()
                                                                        .name("ids").in(ParameterIn.QUERY)
                                                                        .description("The unique identifiers of the status records that should be included in the deletion")
                                                                        .implementation(Long.class))
                                                        .response(
                                                                responseBuilder()
                                                                        .responseCode("200").description("The status records were successfully deleted")
                                                                        .implementation(Integer.class)
                                                                        .description("The number of status records successfully deleted"))
                                                        .response(
                                                                responseBuilder()
                                                                        .responseCode("500").description("An unexpected condition was encountered while deleting the status records")
                                                                        .implementation(String.class)))
                                        .build()));
    }

}
/*
 * Copyright (C) 2021 Second Mile
 *
 * This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0.
 * If a copy of the MPL was not distributed with this file,
 * You can obtain one at http://mozilla.org/MPL/2.0/.
 */
package ke.co.miles.logicalschemes.configurations;

import static org.springdoc.core.fn.builders.apiresponse.Builder.responseBuilder;
import static org.springdoc.core.fn.builders.content.Builder.contentBuilder;
import static org.springdoc.core.fn.builders.parameter.Builder.parameterBuilder;
import static org.springdoc.core.fn.builders.requestbody.Builder.requestBodyBuilder;
import static org.springdoc.core.fn.builders.schema.Builder.schemaBuilder;
import static org.springdoc.webflux.core.fn.SpringdocRouteBuilder.route;
import static org.springframework.http.MediaType.APPLICATION_JSON;
import static org.springframework.web.reactive.function.server.RequestPredicates.accept;
import static org.springframework.web.reactive.function.server.RequestPredicates.contentType;

import io.swagger.v3.oas.annotations.enums.ParameterIn;
import ke.co.miles.logicalschemes.handlers.LogicalSchemesHandler;
import ke.co.miles.logicalschemes.models.LogicalScheme;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.reactive.function.server.RouterFunction;
import org.springframework.web.reactive.function.server.ServerResponse;

/**
 * @author Kwaje Anthony <tony@miles.co.ke>
 * @version 1.0
 * @since 0.0.1
 */
@Configuration
public class RoutesConfig {

  @Bean
  RouterFunction<ServerResponse> routeRequests(LogicalSchemesHandler handler) {

    return
        route()
            .POST("/api/v1/logical_schemes",
                accept(APPLICATION_JSON).and(contentType(APPLICATION_JSON)),
                handler::createLogicalScheme,
                ops -> ops
                    .tag("Create")
                    .operationId("createLogicalScheme")
                    .beanClass(LogicalSchemesHandler.class)
                    .beanMethod("createLogicalScheme")
                    .description("Creates a logicalScheme record")
                    .requestBody(
                        requestBodyBuilder()
                            .content(contentBuilder()
                                .schema(schemaBuilder()
                                    .implementation(LogicalScheme.class))))
                    .response(
                        responseBuilder()
                            .responseCode("201")
                            .description("The logicalScheme record was successfully created")
                            .implementation(LogicalScheme.class))
                    .response(
                        responseBuilder()
                            .responseCode("500").description(
                                "An unexpected condition was encountered while creating the logicalScheme record")
                            .implementation(String.class)))
            .build()

            .and(route()
                .GET("/api/v1/logical_schemes",
                    accept(APPLICATION_JSON),
                    handler::retrieveLogicalSchemes,
                    ops -> ops
                        .tag("Retrieve")
                        .operationId("retrieveLogicalSchemes")
                        .beanClass(LogicalSchemesHandler.class)
                        .beanMethod("retrieveLogicalSchemes")
                        .description("Retrieves logicalSchemes records")
                        .parameter(
                            parameterBuilder()
                                .name("id").in(ParameterIn.QUERY)
                                .description(
                                    "Restrict the records retrieved to the ones whose id is equal to this value")
                                .implementation(Integer.class))
                        .parameter(
                            parameterBuilder()
                                .name("id_lt").in(ParameterIn.QUERY)
                                .description(
                                    "Restrict the records retrieved to the ones whose id is less than this value")
                                .implementation(Integer.class))
                        .parameter(
                            parameterBuilder()
                                .name("id_lte").in(ParameterIn.QUERY)
                                .description(
                                    "Restrict the records retrieved to the ones whose id is less than or equal to this value")
                                .implementation(Integer.class))
                        .parameter(
                            parameterBuilder()
                                .name("id_gt").in(ParameterIn.QUERY)
                                .description(
                                    "Restrict the records retrieved to the ones whose id is greater than this value")
                                .implementation(Integer.class))
                        .parameter(
                            parameterBuilder()
                                .name("id_gte").in(ParameterIn.QUERY)
                                .description(
                                    "Restrict the records retrieved to the ones whose id is greater than or equal to this value")
                                .implementation(Integer.class))
                        .parameter(
                            parameterBuilder()
                                .name("name").in(ParameterIn.QUERY)
                                .description(
                                    "Restrict the records retrieved to the ones whose name is equal to this value")
                                .implementation(Integer.class))
                        .parameter(
                            parameterBuilder()
                                .name("contextId").in(ParameterIn.QUERY)
                                .description(
                                    "Restrict the records retrieved to the ones whose context id is equal to this value")
                                .implementation(Integer.class))
                        .parameter(
                            parameterBuilder()
                                .name("name_like").in(ParameterIn.QUERY)
                                .description(
                                    "Restrict the records retrieved to the ones whose name contain this value fragment")
                                .implementation(Integer.class))
                        .parameter(
                            parameterBuilder()
                                .name("workflow.id").in(ParameterIn.QUERY)
                                .description(
                                    "Restrict the records retrieved to the ones whose timestep id is equal to this value")
                                .implementation(Integer.class))
                        .parameter(
                            parameterBuilder()
                                .name("_page").in(ParameterIn.QUERY)
                                .description(
                                    "Restrict the records retrieved to the ones that fall under this page")
                                .implementation(Integer.class))
                        .parameter(
                            parameterBuilder()
                                .name("_limit").in(ParameterIn.QUERY)
                                .description(
                                    "Restrict the records retrieved to this maximum")
                                .implementation(Integer.class))
                        .parameter(
                            parameterBuilder()
                                .name("_sort").in(ParameterIn.QUERY)
                                .description(
                                    "Sort the records retrieved by this field")
                                .implementation(Integer.class))
                        .parameter(
                            parameterBuilder()
                                .name("_order").in(ParameterIn.QUERY)
                                .description(
                                    "Sort the records retrieved by this criteria - asc or desc")
                                .implementation(Integer.class))
                        .response(
                            responseBuilder()
                                .responseCode("200").description(
                                    "The logicalSchemes records were successfully retrieved")
                                .implementationArray(LogicalScheme.class))
                        .response(
                            responseBuilder()
                                .responseCode("500").description(
                                    "An unexpected condition was encountered while retrieving the logicalSchemes records")
                                .implementation(String.class)))
                .build())
            .and(route()
                .GET("/api/v1/logical_schemes/{id}",
                    accept(APPLICATION_JSON),
                    handler::retrieveLogicalScheme,
                    ops -> ops
                        .tag("Retrieve")
                        .operationId("retrieveLogicalScheme")
                        .beanClass(LogicalSchemesHandler.class)
                        .beanMethod("retrieveLogicalScheme")
                        .description("Retrieves a logicalScheme record")
                        .parameter(
                            parameterBuilder()
                                .name("id").in(ParameterIn.PATH)
                                .description(
                                    "Retrieve the record whose id is equal to this value")
                                .implementation(Long.class))
                        .response(
                            responseBuilder()
                                .responseCode("200")
                                .description("The logicalScheme record was successfully retrieved")
                                .implementation(LogicalScheme.class))
                        .response(
                            responseBuilder()
                                .responseCode("500").description(
                                    "An unexpected condition was encountered while retrieving the logicalScheme record")
                                .implementation(String.class)))
                .build())

            .and(route()
                .PUT("/api/v1/logical_schemes/{id}",
                    accept(APPLICATION_JSON).and(contentType(APPLICATION_JSON)),
                    handler::updateLogicalScheme,
                    ops -> ops
                        .tag("Update")
                        .operationId("updateLogicalScheme")
                        .beanClass(LogicalSchemesHandler.class)
                        .beanMethod("updateLogicalScheme")
                        .description("Updates a logicalScheme record")
                        .parameter(
                            parameterBuilder()
                                .name("id").in(ParameterIn.PATH)
                                .description(
                                    "Update the record whose id is equal to this value")
                                .implementation(Long.class))
                        .response(
                            responseBuilder()
                                .responseCode("200")
                                .description("The logicalScheme record was successfully updated")
                                .implementation(LogicalScheme.class))
                        .response(
                            responseBuilder()
                                .responseCode("500").description(
                                    "An unexpected condition was encountered while updating the logicalScheme record")
                                .implementation(String.class)))
                .build())

            .and(route()
                .DELETE("/api/v1/logical_schemes/{id}",
                    accept(APPLICATION_JSON),
                    handler::deleteLogicalScheme,
                    ops -> ops
                        .tag("Delete")
                        .operationId("deleteLogicalScheme")
                        .beanClass(LogicalSchemesHandler.class)
                        .beanMethod("deleteLogicalScheme")
                        .description(
                            "Deletes a logicalScheme record")
                        .parameter(
                            parameterBuilder()
                                .name("id").in(ParameterIn.PATH)
                                .description(
                                    "Delete the record whose id is equal to this value")
                                .implementation(Long.class))
                        .response(
                            responseBuilder()
                                .responseCode("200")
                                .description("The logicalScheme record was successfully deleted")
                                .implementation(Integer.class)
                                .description(
                                    "The number of logicalSchemes records successfully deleted"))
                        .response(
                            responseBuilder()
                                .responseCode("500").description(
                                    "An unexpected condition was encountered while deleting the logicalScheme record")
                                .implementation(String.class)))
                .build());
  }

}
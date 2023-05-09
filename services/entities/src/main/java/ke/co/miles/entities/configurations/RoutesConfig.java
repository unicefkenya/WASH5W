/*
 * Copyright (C) 2021 Second Mile
 *
 * This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0.
 * If a copy of the MPL was not distributed with this file,
 * You can obtain one at http://mozilla.org/MPL/2.0/.
 */
package ke.co.miles.entities.configurations;

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
import ke.co.miles.entities.handlers.EntitiesHandler;
import ke.co.miles.entities.models.Entity;
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
  RouterFunction<ServerResponse> routeRequests(EntitiesHandler handler) {

    return
        route()
            .POST("/api/v1/entities/{database}",
                accept(APPLICATION_JSON).and(contentType(APPLICATION_JSON)),
                handler::createEntity,
                ops -> ops
                    .tag("Create")
                    .operationId("createEntity")
                    .beanClass(EntitiesHandler.class)
                    .beanMethod("createEntity")
                    .description("Creates an entity record")
                    .parameter(
                        parameterBuilder()
                            .name("database").in(ParameterIn.PATH)
                            .description("Create the record in this database")
                            .implementation(String.class))
                    .requestBody(
                        requestBodyBuilder()
                            .content(contentBuilder()
                                .schema(schemaBuilder()
                                    .implementation(Entity.class))))
                    .response(
                        responseBuilder()
                            .responseCode("201")
                            .description("The entity record was successfully created")
                            .implementation(Entity.class))
                    .response(
                        responseBuilder()
                            .responseCode("500").description(
                                "An unexpected condition was encountered while creating the entity record")
                            .implementation(String.class)))
            .build()

            .and(route()
                .GET("/api/v1/entities/{database}",
                    accept(APPLICATION_JSON),
                    handler::retrieveEntities,
                    ops -> ops
                        .tag("Retrieve")
                        .operationId("retrieveEntities")
                        .beanClass(EntitiesHandler.class)
                        .beanMethod("retrieveEntities")
                        .description("Retrieves entities records")
                        .parameter(
                            parameterBuilder()
                                .name("database").in(ParameterIn.PATH)
                                .description(
                                    "Retrieve the records from this database")
                                .implementation(String.class))
                        .parameter(
                            parameterBuilder()
                                .name("id").in(ParameterIn.QUERY)
                                .description(
                                    "Restrict the records retrieved to the ones whose identity is equal to this value")
                                .implementation(Integer.class))
                        .parameter(
                            parameterBuilder()
                                .name("id_lt").in(ParameterIn.QUERY)
                                .description(
                                    "Restrict the records retrieved to the ones whose identity is less than this value")
                                .implementation(Integer.class))
                        .parameter(
                            parameterBuilder()
                                .name("id_lte").in(ParameterIn.QUERY)
                                .description(
                                    "Restrict the records retrieved to the ones whose identity is less than or equal to this value")
                                .implementation(Integer.class))
                        .parameter(
                            parameterBuilder()
                                .name("id_gt").in(ParameterIn.QUERY)
                                .description(
                                    "Restrict the records retrieved to the ones whose identity is greater than this value")
                                .implementation(Integer.class))
                        .parameter(
                            parameterBuilder()
                                .name("id_gte").in(ParameterIn.QUERY)
                                .description(
                                    "Restrict the records retrieved to the ones whose identity is greater than or equal to this value")
                                .implementation(Integer.class))
                        .parameter(
                            parameterBuilder()
                                .name("name").in(ParameterIn.QUERY)
                                .description(
                                    "Restrict the records retrieved to the ones whose name is equal to this value")
                                .implementation(Integer.class))
                        .parameter(
                            parameterBuilder()
                                .name("name_like").in(ParameterIn.QUERY)
                                .description(
                                    "Restrict the records retrieved to the ones whose name contain this value fragment")
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
                                    "The entities records were successfully retrieved")
                                .implementationArray(Entity.class))
                        .response(
                            responseBuilder()
                                .responseCode("500").description(
                                    "An unexpected condition was encountered while retrieving the entities records")
                                .implementation(String.class)))
                .build())
            .and(route()
                .GET("/api/v1/entities/{database}/{id}",
                    accept(APPLICATION_JSON),
                    handler::retrieveEntity,
                    ops -> ops
                        .tag("Retrieve")
                        .operationId("retrieveEntity")
                        .beanClass(EntitiesHandler.class)
                        .beanMethod("retrieveEntity")
                        .description("Retrieves an entity record")
                        .parameter(
                            parameterBuilder()
                                .name("database").in(ParameterIn.PATH)
                                .description("Retrieve the record from this database")
                                .implementation(String.class))
                        .parameter(
                            parameterBuilder()
                                .name("id").in(ParameterIn.PATH)
                                .description(
                                    "Retrieve the record whose identity is equal to this value")
                                .implementation(Long.class))
                        .response(
                            responseBuilder()
                                .responseCode("200")
                                .description("The entity record was successfully retrieved")
                                .implementation(Entity.class))
                        .response(
                            responseBuilder()
                                .responseCode("500").description(
                                    "An unexpected condition was encountered while retrieving the entity record")
                                .implementation(String.class)))
                .build())

            .and(route()
                .PUT("/api/v1/entities/{database}/{id}",
                    accept(APPLICATION_JSON).and(contentType(APPLICATION_JSON)),
                    handler::updateEntity,
                    ops -> ops
                        .tag("Update")
                        .operationId("updateEntity")
                        .beanClass(EntitiesHandler.class)
                        .beanMethod("updateEntity")
                        .description("Updates an entity record")
                        .parameter(
                            parameterBuilder()
                                .name("database").in(ParameterIn.PATH)
                                .description("Carry out the record update in this database")
                                .implementation(String.class))
                        .parameter(
                            parameterBuilder()
                                .name("id").in(ParameterIn.PATH)
                                .description(
                                    "Update the record whose identity is equal to this value")
                                .implementation(Long.class))
                        .response(
                            responseBuilder()
                                .responseCode("200")
                                .description("The entity record was successfully updated")
                                .implementation(Entity.class))
                        .response(
                            responseBuilder()
                                .responseCode("500").description(
                                    "An unexpected condition was encountered while updating the entity record")
                                .implementation(String.class)))
                .build())

            .and(route()
                .DELETE("/api/v1/entities/{database}/{id}",
                    accept(APPLICATION_JSON),
                    handler::deleteEntity,
                    ops -> ops
                        .tag("Delete")
                        .operationId("deleteEntity")
                        .beanClass(EntitiesHandler.class)
                        .beanMethod("deleteEntity")
                        .description(
                            "Deletes an entity record")
                        .parameter(
                            parameterBuilder()
                                .name("database").in(ParameterIn.PATH)
                                .description("Carry out the record deletion in this database")
                                .implementation(String.class))
                        .parameter(
                            parameterBuilder()
                                .name("id").in(ParameterIn.PATH)
                                .description(
                                    "Delete the record whose identity is equal to this value")
                                .implementation(Long.class))
                        .response(
                            responseBuilder()
                                .responseCode("200")
                                .description("The entity record was successfully deleted")
                                .implementation(Integer.class)
                                .description(
                                    "The number of entities records successfully deleted"))
                        .response(
                            responseBuilder()
                                .responseCode("500").description(
                                    "An unexpected condition was encountered while deleting the entity record")
                                .implementation(String.class)))
                .build());
  }

}
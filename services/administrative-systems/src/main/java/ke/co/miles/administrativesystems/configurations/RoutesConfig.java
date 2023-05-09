/*
 * Copyright (C) 2021 Second Mile
 *
 * This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0.
 * If a copy of the MPL was not distributed with this file,
 * You can obtain one at http://mozilla.org/MPL/2.0/.
 */
package ke.co.miles.administrativesystems.configurations;

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
import ke.co.miles.administrativesystems.handlers.AdministrativeSystemsHandler;
import ke.co.miles.administrativesystems.models.AdministrativeSystem;
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
  RouterFunction<ServerResponse> routeRequests(AdministrativeSystemsHandler handler) {

    return
        route()
            .POST("/api/v1/administrative_systems",
                accept(APPLICATION_JSON).and(contentType(APPLICATION_JSON)),
                handler::createAdministrativeSystem,
                ops -> ops
                    .tag("Create")
                    .operationId("createAdministrativeSystem")
                    .beanClass(AdministrativeSystemsHandler.class)
                    .beanMethod("createAdministrativeSystem")
                    .description("Creates a administrativeSystem record")
                    .requestBody(
                        requestBodyBuilder()
                            .content(contentBuilder()
                                .schema(schemaBuilder()
                                    .implementation(AdministrativeSystem.class))))
                    .response(
                        responseBuilder()
                            .responseCode("201")
                            .description("The administrativeSystem record was successfully created")
                            .implementation(AdministrativeSystem.class))
                    .response(
                        responseBuilder()
                            .responseCode("500").description(
                                "An unexpected condition was encountered while creating the administrativeSystem record")
                            .implementation(String.class)))
            .build()

            .and(route()
                .GET("/api/v1/administrative_systems",
                    accept(APPLICATION_JSON),
                    handler::retrieveAdministrativeSystems,
                    ops -> ops
                        .tag("Retrieve")
                        .operationId("retrieveAdministrativeSystems")
                        .beanClass(AdministrativeSystemsHandler.class)
                        .beanMethod("retrieveAdministrativeSystems")
                        .description("Retrieves administrativeSystems records")
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
                                    "The administrativeSystems records were successfully retrieved")
                                .implementationArray(AdministrativeSystem.class))
                        .response(
                            responseBuilder()
                                .responseCode("500").description(
                                    "An unexpected condition was encountered while retrieving the administrativeSystems records")
                                .implementation(String.class)))
                .build())
            .and(route()
                .GET("/api/v1/administrative_systems/{id}",
                    accept(APPLICATION_JSON),
                    handler::retrieveAdministrativeSystem,
                    ops -> ops
                        .tag("Retrieve")
                        .operationId("retrieveAdministrativeSystem")
                        .beanClass(AdministrativeSystemsHandler.class)
                        .beanMethod("retrieveAdministrativeSystem")
                        .description("Retrieves a administrativeSystem record")
                        .parameter(
                            parameterBuilder()
                                .name("id").in(ParameterIn.PATH)
                                .description(
                                    "Retrieve the record whose id is equal to this value")
                                .implementation(Long.class))
                        .response(
                            responseBuilder()
                                .responseCode("200")
                                .description("The administrativeSystem record was successfully retrieved")
                                .implementation(AdministrativeSystem.class))
                        .response(
                            responseBuilder()
                                .responseCode("500").description(
                                    "An unexpected condition was encountered while retrieving the administrativeSystem record")
                                .implementation(String.class)))
                .build())

            .and(route()
                .PUT("/api/v1/administrative_systems/{id}",
                    accept(APPLICATION_JSON).and(contentType(APPLICATION_JSON)),
                    handler::updateAdministrativeSystem,
                    ops -> ops
                        .tag("Update")
                        .operationId("updateAdministrativeSystem")
                        .beanClass(AdministrativeSystemsHandler.class)
                        .beanMethod("updateAdministrativeSystem")
                        .description("Updates a administrativeSystem record")
                        .parameter(
                            parameterBuilder()
                                .name("id").in(ParameterIn.PATH)
                                .description(
                                    "Update the record whose id is equal to this value")
                                .implementation(Long.class))
                        .response(
                            responseBuilder()
                                .responseCode("200")
                                .description("The administrativeSystem record was successfully updated")
                                .implementation(AdministrativeSystem.class))
                        .response(
                            responseBuilder()
                                .responseCode("500").description(
                                    "An unexpected condition was encountered while updating the administrativeSystem record")
                                .implementation(String.class)))
                .build())

            .and(route()
                .DELETE("/api/v1/administrative_systems/{id}",
                    accept(APPLICATION_JSON),
                    handler::deleteAdministrativeSystem,
                    ops -> ops
                        .tag("Delete")
                        .operationId("deleteAdministrativeSystem")
                        .beanClass(AdministrativeSystemsHandler.class)
                        .beanMethod("deleteAdministrativeSystem")
                        .description(
                            "Deletes a administrativeSystem record")
                        .parameter(
                            parameterBuilder()
                                .name("id").in(ParameterIn.PATH)
                                .description(
                                    "Delete the record whose id is equal to this value")
                                .implementation(Long.class))
                        .response(
                            responseBuilder()
                                .responseCode("200")
                                .description("The administrativeSystem record was successfully deleted")
                                .implementation(Integer.class)
                                .description(
                                    "The number of administrativeSystems records successfully deleted"))
                        .response(
                            responseBuilder()
                                .responseCode("500").description(
                                    "An unexpected condition was encountered while deleting the administrativeSystem record")
                                .implementation(String.class)))
                .build());
  }

}
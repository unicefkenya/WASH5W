/*
 * Copyright (C) 2021 Second Mile
 *
 * This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0.
 * If a copy of the MPL was not distributed with this file,
 * You can obtain one at http://mozilla.org/MPL/2.0/.
 */
package ke.co.miles.organisations.configurations;

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
import ke.co.miles.organisations.handlers.OrganisationsHandler;
import ke.co.miles.organisations.models.Organisation;
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
  RouterFunction<ServerResponse> routeRequests(OrganisationsHandler handler) {

    return
        route()
            .POST("/api/v1/organisations",
                accept(APPLICATION_JSON).and(contentType(APPLICATION_JSON)),
                handler::createOrganisation,
                ops -> ops
                    .tag("Create")
                    .operationId("createOrganisation")
                    .beanClass(OrganisationsHandler.class)
                    .beanMethod("createOrganisation")
                    .description("Creates a organisation record")
                    .requestBody(
                        requestBodyBuilder()
                            .content(contentBuilder()
                                .schema(schemaBuilder()
                                    .implementation(Organisation.class))))
                    .response(
                        responseBuilder()
                            .responseCode("201")
                            .description("The organisation record was successfully created")
                            .implementation(Organisation.class))
                    .response(
                        responseBuilder()
                            .responseCode("500").description(
                                "An unexpected condition was encountered while creating the organisation record")
                            .implementation(String.class)))
            .build()

            .and(route()
                .GET("/api/v1/organisations",
                    accept(APPLICATION_JSON),
                    handler::retrieveOrganisations,
                    ops -> ops
                        .tag("Retrieve")
                        .operationId("retrieveOrganisations")
                        .beanClass(OrganisationsHandler.class)
                        .beanMethod("retrieveOrganisations")
                        .description("Retrieves organisations records")
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
                                   .name("organisationType.id").in(ParameterIn.QUERY)
                                   .description(
                                       "Restrict the records retrieved to the ones whose organisation type id is equal to this value")
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
                                    "The organisations records were successfully retrieved")
                                .implementationArray(Organisation.class))
                        .response(
                            responseBuilder()
                                .responseCode("500").description(
                                    "An unexpected condition was encountered while retrieving the organisations records")
                                .implementation(String.class)))
                .build())
            .and(route()
                .GET("/api/v1/organisations/{id}",
                    accept(APPLICATION_JSON),
                    handler::retrieveOrganisation,
                    ops -> ops
                        .tag("Retrieve")
                        .operationId("retrieveOrganisation")
                        .beanClass(OrganisationsHandler.class)
                        .beanMethod("retrieveOrganisation")
                        .description("Retrieves a organisation record")
                        .parameter(
                            parameterBuilder()
                                .name("id").in(ParameterIn.PATH)
                                .description(
                                    "Retrieve the record whose id is equal to this value")
                                .implementation(Long.class))
                        .response(
                            responseBuilder()
                                .responseCode("200")
                                .description("The organisation record was successfully retrieved")
                                .implementation(Organisation.class))
                        .response(
                            responseBuilder()
                                .responseCode("500").description(
                                    "An unexpected condition was encountered while retrieving the organisation record")
                                .implementation(String.class)))
                .build())

            .and(route()
                .PUT("/api/v1/organisations/{id}",
                    accept(APPLICATION_JSON).and(contentType(APPLICATION_JSON)),
                    handler::updateOrganisation,
                    ops -> ops
                        .tag("Update")
                        .operationId("updateOrganisation")
                        .beanClass(OrganisationsHandler.class)
                        .beanMethod("updateOrganisation")
                        .description("Updates a organisation record")
                        .parameter(
                            parameterBuilder()
                                .name("id").in(ParameterIn.PATH)
                                .description(
                                    "Update the record whose id is equal to this value")
                                .implementation(Long.class))
                        .response(
                            responseBuilder()
                                .responseCode("200")
                                .description("The organisation record was successfully updated")
                                .implementation(Organisation.class))
                        .response(
                            responseBuilder()
                                .responseCode("500").description(
                                    "An unexpected condition was encountered while updating the organisation record")
                                .implementation(String.class)))
                .build())

            .and(route()
                .DELETE("/api/v1/organisations/{id}",
                    accept(APPLICATION_JSON),
                    handler::deleteOrganisation,
                    ops -> ops
                        .tag("Delete")
                        .operationId("deleteOrganisation")
                        .beanClass(OrganisationsHandler.class)
                        .beanMethod("deleteOrganisation")
                        .description(
                            "Deletes a organisation record")
                        .parameter(
                            parameterBuilder()
                                .name("id").in(ParameterIn.PATH)
                                .description(
                                    "Delete the record whose id is equal to this value")
                                .implementation(Long.class))
                        .response(
                            responseBuilder()
                                .responseCode("200")
                                .description("The organisation record was successfully deleted")
                                .implementation(Integer.class)
                                .description(
                                    "The number of organisations records successfully deleted"))
                        .response(
                            responseBuilder()
                                .responseCode("500").description(
                                    "An unexpected condition was encountered while deleting the organisation record")
                                .implementation(String.class)))
                .build());
  }

}
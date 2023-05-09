/*
 * Copyright (C) 2021 Second Mile
 *
 * This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0.
 * If a copy of the MPL was not distributed with this file,
 * You can obtain one at http://mozilla.org/MPL/2.0/.
 */
package ke.co.miles.options.configurations;

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
import ke.co.miles.options.handlers.OptionsHandler;
import ke.co.miles.options.models.Option;
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
  RouterFunction<ServerResponse> routeRequests(OptionsHandler handler) {

    return
        route()
            .POST("/api/v1/options",
                accept(APPLICATION_JSON).and(contentType(APPLICATION_JSON)),
                handler::createOption,
                ops -> ops
                    .tag("Create")
                    .operationId("createOption")
                    .beanClass(OptionsHandler.class)
                    .beanMethod("createOption")
                    .description("Creates a option record")
                    .requestBody(
                        requestBodyBuilder()
                            .content(contentBuilder()
                                .schema(schemaBuilder()
                                    .implementation(Option.class))))
                    .response(
                        responseBuilder()
                            .responseCode("201")
                            .description("The option record was successfully created")
                            .implementation(Option.class))
                    .response(
                        responseBuilder()
                            .responseCode("500").description(
                                "An unexpected condition was encountered while creating the option record")
                            .implementation(String.class)))
            .build()

            .and(route()
                .GET("/api/v1/options",
                    accept(APPLICATION_JSON),
                    handler::retrieveOptions,
                    ops -> ops
                        .tag("Retrieve")
                        .operationId("retrieveOptions")
                        .beanClass(OptionsHandler.class)
                        .beanMethod("retrieveOptions")
                        .description("Retrieves options records")
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
                                    .name("administrativeUnitType.id").in(ParameterIn.QUERY)
                                    .description(
                                       "Restrict the records retrieved to the ones whose administrative unit type id is equal to this value")
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
                                    "The options records were successfully retrieved")
                                .implementationArray(Option.class))
                        .response(
                            responseBuilder()
                                .responseCode("500").description(
                                    "An unexpected condition was encountered while retrieving the options records")
                                .implementation(String.class)))
                .build())
            .and(route()
                .GET("/api/v1/options/{id}",
                    accept(APPLICATION_JSON),
                    handler::retrieveOption,
                    ops -> ops
                        .tag("Retrieve")
                        .operationId("retrieveOption")
                        .beanClass(OptionsHandler.class)
                        .beanMethod("retrieveOption")
                        .description("Retrieves a option record")
                        .parameter(
                            parameterBuilder()
                                .name("id").in(ParameterIn.PATH)
                                .description(
                                    "Retrieve the record whose id is equal to this value")
                                .implementation(Long.class))
                        .response(
                            responseBuilder()
                                .responseCode("200")
                                .description("The option record was successfully retrieved")
                                .implementation(Option.class))
                        .response(
                            responseBuilder()
                                .responseCode("500").description(
                                    "An unexpected condition was encountered while retrieving the option record")
                                .implementation(String.class)))
                .build())

            .and(route()
                .PUT("/api/v1/options/{id}",
                    accept(APPLICATION_JSON).and(contentType(APPLICATION_JSON)),
                    handler::updateOption,
                    ops -> ops
                        .tag("Update")
                        .operationId("updateOption")
                        .beanClass(OptionsHandler.class)
                        .beanMethod("updateOption")
                        .description("Updates a option record")
                        .parameter(
                            parameterBuilder()
                                .name("id").in(ParameterIn.PATH)
                                .description(
                                    "Update the record whose id is equal to this value")
                                .implementation(Long.class))
                        .response(
                            responseBuilder()
                                .responseCode("200")
                                .description("The option record was successfully updated")
                                .implementation(Option.class))
                        .response(
                            responseBuilder()
                                .responseCode("500").description(
                                    "An unexpected condition was encountered while updating the option record")
                                .implementation(String.class)))
                .build())

            .and(route()
                .DELETE("/api/v1/options/{id}",
                    accept(APPLICATION_JSON),
                    handler::deleteOption,
                    ops -> ops
                        .tag("Delete")
                        .operationId("deleteOption")
                        .beanClass(OptionsHandler.class)
                        .beanMethod("deleteOption")
                        .description(
                            "Deletes a option record")
                        .parameter(
                            parameterBuilder()
                                .name("id").in(ParameterIn.PATH)
                                .description(
                                    "Delete the record whose id is equal to this value")
                                .implementation(Long.class))
                        .response(
                            responseBuilder()
                                .responseCode("200")
                                .description("The option record was successfully deleted")
                                .implementation(Integer.class)
                                .description(
                                    "The number of options records successfully deleted"))
                        .response(
                            responseBuilder()
                                .responseCode("500").description(
                                    "An unexpected condition was encountered while deleting the option record")
                                .implementation(String.class)))
                .build());
  }

}
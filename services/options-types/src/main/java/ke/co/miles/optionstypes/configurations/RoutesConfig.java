/*
 * Copyright (C) 2021 Second Mile
 *
 * This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0.
 * If a copy of the MPL was not distributed with this file,
 * You can obtain one at http://mozilla.org/MPL/2.0/.
 */
package ke.co.miles.optionstypes.configurations;

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
import ke.co.miles.optionstypes.handlers.OptionsTypesHandler;
import ke.co.miles.optionstypes.models.OptionType;
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
  RouterFunction<ServerResponse> routeRequests(OptionsTypesHandler handler) {

    return
        route()
            .POST("/api/v1/options_types",
                accept(APPLICATION_JSON).and(contentType(APPLICATION_JSON)),
                handler::createOptionType,
                ops -> ops
                    .tag("Create")
                    .operationId("createOptionType")
                    .beanClass(OptionsTypesHandler.class)
                    .beanMethod("createOptionType")
                    .description("Creates a optionType record")
                    .requestBody(
                        requestBodyBuilder()
                            .content(contentBuilder()
                                .schema(schemaBuilder()
                                    .implementation(OptionType.class))))
                    .response(
                        responseBuilder()
                            .responseCode("201")
                            .description("The optionType record was successfully created")
                            .implementation(OptionType.class))
                    .response(
                        responseBuilder()
                            .responseCode("500").description(
                                "An unexpected condition was encountered while creating the optionType record")
                            .implementation(String.class)))
            .build()

            .and(route()
                .GET("/api/v1/options_types",
                    accept(APPLICATION_JSON),
                    handler::retrieveOptionsTypes,
                    ops -> ops
                        .tag("Retrieve")
                        .operationId("retrieveOptionsTypes")
                        .beanClass(OptionsTypesHandler.class)
                        .beanMethod("retrieveOptionsTypes")
                        .description("Retrieves optionsTypes records")
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
                                    "The optionsTypes records were successfully retrieved")
                                .implementationArray(OptionType.class))
                        .response(
                            responseBuilder()
                                .responseCode("500").description(
                                    "An unexpected condition was encountered while retrieving the optionsTypes records")
                                .implementation(String.class)))
                .build())
            .and(route()
                .GET("/api/v1/options_types/{id}",
                    accept(APPLICATION_JSON),
                    handler::retrieveOptionType,
                    ops -> ops
                        .tag("Retrieve")
                        .operationId("retrieveOptionType")
                        .beanClass(OptionsTypesHandler.class)
                        .beanMethod("retrieveOptionType")
                        .description("Retrieves a optionType record")
                        .parameter(
                            parameterBuilder()
                                .name("id").in(ParameterIn.PATH)
                                .description(
                                    "Retrieve the record whose id is equal to this value")
                                .implementation(Long.class))
                        .response(
                            responseBuilder()
                                .responseCode("200")
                                .description("The optionType record was successfully retrieved")
                                .implementation(OptionType.class))
                        .response(
                            responseBuilder()
                                .responseCode("500").description(
                                    "An unexpected condition was encountered while retrieving the optionType record")
                                .implementation(String.class)))
                .build())

            .and(route()
                .PUT("/api/v1/options_types/{id}",
                    accept(APPLICATION_JSON).and(contentType(APPLICATION_JSON)),
                    handler::updateOptionType,
                    ops -> ops
                        .tag("Update")
                        .operationId("updateOptionType")
                        .beanClass(OptionsTypesHandler.class)
                        .beanMethod("updateOptionType")
                        .description("Updates a optionType record")
                        .parameter(
                            parameterBuilder()
                                .name("id").in(ParameterIn.PATH)
                                .description(
                                    "Update the record whose id is equal to this value")
                                .implementation(Long.class))
                        .response(
                            responseBuilder()
                                .responseCode("200")
                                .description("The optionType record was successfully updated")
                                .implementation(OptionType.class))
                        .response(
                            responseBuilder()
                                .responseCode("500").description(
                                    "An unexpected condition was encountered while updating the optionType record")
                                .implementation(String.class)))
                .build())

            .and(route()
                .DELETE("/api/v1/options_types/{id}",
                    accept(APPLICATION_JSON),
                    handler::deleteOptionType,
                    ops -> ops
                        .tag("Delete")
                        .operationId("deleteOptionType")
                        .beanClass(OptionsTypesHandler.class)
                        .beanMethod("deleteOptionType")
                        .description(
                            "Deletes a optionType record")
                        .parameter(
                            parameterBuilder()
                                .name("id").in(ParameterIn.PATH)
                                .description(
                                    "Delete the record whose id is equal to this value")
                                .implementation(Long.class))
                        .response(
                            responseBuilder()
                                .responseCode("200")
                                .description("The optionType record was successfully deleted")
                                .implementation(Integer.class)
                                .description(
                                    "The number of optionsTypes records successfully deleted"))
                        .response(
                            responseBuilder()
                                .responseCode("500").description(
                                    "An unexpected condition was encountered while deleting the optionType record")
                                .implementation(String.class)))
                .build());
  }

}
/*
 * Copyright (C) 2021 Second Mile
 *
 * This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0.
 * If a copy of the MPL was not distributed with this file,
 * You can obtain one at http://mozilla.org/MPL/2.0/.
 */
package ke.co.miles.accountabilities.configurations;

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

import io.swagger.v3.oas.annotations.enums.ParameterIn;
import ke.co.miles.accountabilities.handlers.AccountabilitiesHandler;
import ke.co.miles.accountabilities.models.Accountability;
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
  RouterFunction<ServerResponse> routeRequests(AccountabilitiesHandler handler) {

    return
        route()
            .POST("/api/v1/accountabilities/{database}",
                accept(APPLICATION_JSON).and(contentType(APPLICATION_JSON)),
                handler::createAccountability,
                ops -> ops
                    .tag("Create")
                    .operationId("createAccountability")
                    .beanClass(AccountabilitiesHandler.class)
                    .beanMethod("createAccountability")
                    .description("Inserts a single accountability record into the database")
                    .parameter(
                        parameterBuilder()
                            .name("database").in(ParameterIn.PATH)
                            .description(
                                "The name of the database within which the accountability record should be inserted")
                            .implementation(String.class))
                    .requestBody(
                        requestBodyBuilder()
                            .content(contentBuilder()
                                .schema(schemaBuilder()
                                    .implementation(Accountability.class))))
                    .response(
                        responseBuilder()
                            .responseCode("201")
                            .description("The accountability record was successfully created")
                            .implementation(Accountability.class))
                    .response(
                        responseBuilder()
                            .responseCode("500").description(
                                "An unexpected condition was encountered while creating the accountability record")
                            .implementation(String.class)))
            .build()

            .and(route()
                .POST("/api/v1/accountabilities/{database}/all",
                    accept(APPLICATION_JSON).and(contentType(APPLICATION_JSON)),
                    handler::createAccountabilities,
                    ops -> ops
                        .tag("Create")
                        .operationId("createAccountabilities")
                        .beanClass(AccountabilitiesHandler.class)
                        .beanMethod("createAccountabilities")
                        .description(
                            "Inserts several accountabilities records into the database")
                        .parameter(
                            parameterBuilder()
                                .name("database").in(ParameterIn.PATH)
                                .description(
                                    "The name of the database within which the accountabilities records should be inserted")
                                .implementation(String.class))
                        .requestBody(
                            requestBodyBuilder()
                                .content(contentBuilder()
                                    .array(arraySchemaBuilder()
                                        .schema(schemaBuilder()
                                            .implementation(Accountability.class)))))

                        .response(
                            responseBuilder()
                                .responseCode("201").description(
                                    "The accountabilities records were successfully created")
                                .implementationArray(Accountability.class))

                        .response(
                            responseBuilder()
                                .responseCode("500").description(
                                    "An unexpected condition was encountered while creating the accountabilities records")
                                .implementation(String.class)))
                .build()

                .and(route()
                    .GET("/api/v1/accountabilities/{database}/ids/{id}",
                        accept(APPLICATION_JSON),
                        handler::retrieveAccountability,
                        ops -> ops
                            .tag("Retrieve")
                            .operationId("retrieveAccountability")
                            .beanClass(AccountabilitiesHandler.class)
                            .beanMethod("retrieveAccountability")
                            .description(
                                "Retrieves a single accountability record from the database given its unique identifier")
                            .parameter(
                                parameterBuilder()
                                    .name("database").in(ParameterIn.PATH)
                                    .description(
                                        "The name of the database from which the accountability record should be retrieved")
                                    .implementation(String.class))
                            .parameter(
                                parameterBuilder()
                                    .name("id").in(ParameterIn.PATH)
                                    .description(
                                        "The unique identifier of the accountability record that should be retrieved")
                                    .implementation(Long.class))
                            .response(
                                responseBuilder()
                                    .responseCode("200").description(
                                        "The accountability record was successfully retrieved")
                                    .implementation(Accountability.class))
                            .response(
                                responseBuilder()
                                    .responseCode("500").description(
                                        "An unexpected condition was encountered while retrieving the accountability record")
                                    .implementation(String.class)))
                    .build())

                .and(route()
                    .GET("/api/v1/accountabilities/{database}/all",
                        accept(APPLICATION_JSON),
                        handler::retrieveAccountabilities,
                        ops -> ops
                            .tag("Retrieve")
                            .operationId("retrieveAccountabilities")
                            .beanClass(AccountabilitiesHandler.class)
                            .beanMethod("retrieveAccountabilities")
                            .description(
                                "Retrieves all or some of the accountabilities records from the database depending on whether query parameters were included in the query string")
                            .parameter(
                                parameterBuilder()
                                    .name("database").in(ParameterIn.PATH)
                                    .description(
                                        "The name of the database from which the accountabilities records should be retrieved")
                                    .implementation(String.class))
                            .parameter(
                                parameterBuilder()
                                    .name("ids").in(ParameterIn.QUERY)
                                    .description(
                                        "The unique identifiers of the accountabilities records that should be retrieved")
                                    .implementation(Long.class))
                            .parameter(
                                parameterBuilder()
                                    .name("typeId").in(ParameterIn.QUERY)
                                    .description(
                                        "The unique identifier of the accountability type by which the retrieved accountabilities records should be filtered")
                                    .implementation(Integer.class))
                            .parameter(
                                parameterBuilder()
                                    .name("commissionerId").in(ParameterIn.QUERY)
                                    .description(
                                        "The unique identifier of the parent entity type by which the retrieved accountabilities records should be filtered")
                                    .implementation(Integer.class))
                            .parameter(
                                parameterBuilder()
                                    .name("responsibleId").in(ParameterIn.QUERY)
                                    .description(
                                        "The unique identifier of the subsidiary entity type by which the retrieved accountabilities records should be filtered")
                                    .implementation(Integer.class))
                            .parameter(
                                parameterBuilder()
                                    .name("limit").in(ParameterIn.QUERY)
                                    .description(
                                        "The maximum number of accountabilities records to return")
                                    .implementation(Integer.class))
                            .parameter(
                                parameterBuilder()
                                    .name("offset").in(ParameterIn.QUERY)
                                    .description(
                                        "The starting point from which accountabilities records should be retrieved")
                                    .implementation(Integer.class))
                            .response(
                                responseBuilder()
                                    .responseCode("200").description(
                                        "The accountabilities records were successfully retrieved")
                                    .implementationArray(Accountability.class))
                            .response(
                                responseBuilder()
                                    .responseCode("500").description(
                                        "An unexpected condition was encountered while retrieving the accountabilities records")
                                    .implementation(String.class)))
                    .build())

                .and(route()
                    .GET(
                        "/api/v1/accountabilities/{database}/descendants/type/{type}/commissioner/{commissioner}",
                        accept(APPLICATION_JSON),
                        handler::retrieveDescendantAccountabilities,
                        ops -> ops
                            .tag("Retrieve")
                            .operationId("retrieveDescendantAccountabilities")
                            .beanClass(AccountabilitiesHandler.class)
                            .beanMethod("retrieveDescendantAccountabilities")
                            .description(
                                "Retrieves descendant accountabilities records from the database depending on whether path / query parameters were included in the query string")
                            .parameter(
                                parameterBuilder()
                                    .name("database").in(ParameterIn.PATH)
                                    .description(
                                        "The name of the database from which the accountabilities records should be retrieved")
                                    .implementation(String.class))
                            .parameter(
                                parameterBuilder()
                                    .name("typeId").in(ParameterIn.PATH)
                                    .description(
                                        "The unique identifier of the accountability type whose descendant accountabilities records should be retrieved")
                                    .implementation(Integer.class))
                            .parameter(
                                parameterBuilder()
                                    .name("commissionerId").in(ParameterIn.PATH)
                                    .description(
                                        "The unique identifier of the parent entity type whose descendant accountabilities records should be retrieved")
                                    .implementation(Integer.class))
                            .parameter(
                                parameterBuilder()
                                    .name("level").in(ParameterIn.QUERY)
                                    .description(
                                        "The hierarchical level of the descendant accountabilities records to return")
                                    .implementation(Integer.class))
                            .parameter(
                                parameterBuilder()
                                    .name("levelLT").in(ParameterIn.QUERY)
                                    .description(
                                        "The maximum hierarchical level of the descendant accountabilities records to return")
                                    .implementation(Integer.class))
                            .parameter(
                                parameterBuilder()
                                    .name("levelLTE").in(ParameterIn.QUERY)
                                    .description(
                                        "The maximum hierarchical level (inclusive) of the descendant accountabilities records to return")
                                    .implementation(Integer.class))
                            .parameter(
                                parameterBuilder()
                                    .name("levelGT").in(ParameterIn.QUERY)
                                    .description(
                                        "The minimum hierarchical level of the descendant accountabilities records to return")
                                    .implementation(Integer.class))
                            .parameter(
                                parameterBuilder()
                                    .name("levelGTE").in(ParameterIn.QUERY)
                                    .description(
                                        "The minimum hierarchical level (inclusive) of the descendant accountabilities records to return")
                                    .implementation(Integer.class))
                            .parameter(
                                parameterBuilder()
                                    .name("limit").in(ParameterIn.QUERY)
                                    .description(
                                        "The maximum number of accountabilities records to retrieve")
                                    .implementation(Integer.class))
                            .parameter(
                                parameterBuilder()
                                    .name("offset").in(ParameterIn.QUERY)
                                    .description(
                                        "The starting point from which accountabilities records should be retrieved")
                                    .implementation(Integer.class))
                            .response(
                                responseBuilder()
                                    .responseCode("200").description(
                                        "The accountabilities records were successfully retrieved")
                                    .implementationArray(Accountability.class))
                            .response(
                                responseBuilder()
                                    .responseCode("500").description(
                                        "An unexpected condition was encountered while retrieving the accountabilities records")
                                    .implementation(String.class)))
                    .build())
                .and(route()
                    .GET(
                        "/api/v1/accountabilities/{database}/ascendants/type/{type}/responsible/{responsible}",
                        accept(APPLICATION_JSON),
                        handler::retrieveAscendantAccountabilities,
                        ops -> ops
                            .tag("Retrieve")
                            .operationId("retrieveAscendantAccountabilities")
                            .beanClass(AccountabilitiesHandler.class)
                            .beanMethod("retrieveAscendantAccountabilities")
                            .description(
                                "Retrieves ascendant accountabilities records from the database depending on whether path / query parameters were included in the query string")
                            .parameter(
                                parameterBuilder()
                                    .name("database").in(ParameterIn.PATH)
                                    .description(
                                        "The name of the database from which the accountabilities records should be retrieved")
                                    .implementation(String.class))
                            .parameter(
                                parameterBuilder()
                                    .name("typeId").in(ParameterIn.PATH)
                                    .description(
                                        "The unique identifier of the accountability type whose ascendant accountabilities records should be retrieved")
                                    .implementation(Integer.class))
                            .parameter(
                                parameterBuilder()
                                    .name("responsibleId").in(ParameterIn.PATH)
                                    .description(
                                        "The unique identifier of the subsidiary entity type whose ascendant accountabilities records should be retrieved")
                                    .implementation(Integer.class))
                            .parameter(
                                parameterBuilder()
                                    .name("level").in(ParameterIn.QUERY)
                                    .description(
                                        "The hierarchical level of the ascendant accountabilities records to return")
                                    .implementation(Integer.class))
                            .parameter(
                                parameterBuilder()
                                    .name("levelLT").in(ParameterIn.QUERY)
                                    .description(
                                        "The maximum hierarchical level of the ascendant accountabilities records to return")
                                    .implementation(Integer.class))
                            .parameter(
                                parameterBuilder()
                                    .name("levelLTE").in(ParameterIn.QUERY)
                                    .description(
                                        "The maximum hierarchical level (inclusive) of the ascendant accountabilities records to return")
                                    .implementation(Integer.class))
                            .parameter(
                                parameterBuilder()
                                    .name("levelGT").in(ParameterIn.QUERY)
                                    .description(
                                        "The minimum hierarchical level of the ascendant accountabilities records to return")
                                    .implementation(Integer.class))
                            .parameter(
                                parameterBuilder()
                                    .name("levelGTE").in(ParameterIn.QUERY)
                                    .description(
                                        "The minimum hierarchical level (inclusive) of the ascendant accountabilities records to return")
                                    .implementation(Integer.class))
                            .parameter(
                                parameterBuilder()
                                    .name("limit").in(ParameterIn.QUERY)
                                    .description(
                                        "The maximum number of accountabilities records to retrieve")
                                    .implementation(Integer.class))
                            .parameter(
                                parameterBuilder()
                                    .name("offset").in(ParameterIn.QUERY)
                                    .description(
                                        "The starting point from which accountabilities records should be retrieved")
                                    .implementation(Integer.class))
                            .response(
                                responseBuilder()
                                    .responseCode("200").description(
                                        "The accountabilities records were successfully retrieved")
                                    .implementationArray(Accountability.class))
                            .response(
                                responseBuilder()
                                    .responseCode("500").description(
                                        "An unexpected condition was encountered while retrieving the accountabilities records")
                                    .implementation(String.class)))
                    .build())

                .and(route()
                    .GET("/api/v1/accountabilities/{database}/total",
                        accept(APPLICATION_JSON),
                        handler::retrieveTotalAccountabilities,
                        ops -> ops
                            .tag("Retrieve")
                            .operationId("retrieveTotalAccountabilities")
                            .beanClass(AccountabilitiesHandler.class)
                            .beanMethod("retrieveTotalAccountabilities")
                            .description(
                                "Retrieves the estimated or actual count of accountabilities records from the database given a specific query and its parameters")
                            .parameter(
                                parameterBuilder()
                                    .name("database").in(ParameterIn.PATH)
                                    .description(
                                        "The name of the database from which the accountabilities records count should be made")
                                    .implementation(String.class))
                            .parameter(
                                parameterBuilder()
                                    .name("ids").in(ParameterIn.QUERY)
                                    .description(
                                        "The unique identifiers of the accountabilities records that should be included in the count")
                                    .implementation(Long.class))
                            .response(
                                responseBuilder()
                                    .responseCode("200").description(
                                        "The accountabilities records were successfully retrieved")
                                    .implementationArray(Accountability.class))
                            .response(
                                responseBuilder()
                                    .responseCode("500").description(
                                        "An unexpected condition was encountered while retrieving the accountabilities records")
                                    .implementation(String.class)))
                    .build())

                .and(route()
                    .PUT("/api/v1/accountabilities/{database}",
                        accept(APPLICATION_JSON).and(contentType(APPLICATION_JSON)),
                        handler::updateAccountability,
                        ops -> ops
                            .tag("Update")
                            .operationId("updateAccountability")
                            .beanClass(AccountabilitiesHandler.class)
                            .beanMethod("updateAccountability")
                            .description(
                                "Updates a single accountability record in the database")
                            .parameter(
                                parameterBuilder()
                                    .name("database").in(ParameterIn.PATH)
                                    .description(
                                        "The name of the database within which the accountability record should be updated")
                                    .implementation(String.class))
                            .response(
                                responseBuilder()
                                    .responseCode("200").description(
                                        "The accountability record was successfully updated")
                                    .implementation(Accountability.class))
                            .response(
                                responseBuilder()
                                    .responseCode("500").description(
                                        "An unexpected condition was encountered while updating the accountability record")
                                    .implementation(String.class)))
                    .build())

                .and(route()
                    .PUT("/api/v1/accountabilities/{database}/all",
                        accept(APPLICATION_JSON).and(contentType(APPLICATION_JSON)),
                        handler::updateAccountabilities,
                        ops -> ops
                            .tag("Update")
                            .operationId("updateAccountability")
                            .beanClass(AccountabilitiesHandler.class)
                            .beanMethod("updateAccountabilities")
                            .description(
                                "Updates several accountabilities records in the database")
                            .parameter(
                                parameterBuilder()
                                    .name("database").in(ParameterIn.PATH)
                                    .description(
                                        "The name of the database within which the accountabilities records should be updated")
                                    .implementation(String.class))
                            .requestBody(
                                requestBodyBuilder()
                                    .content(contentBuilder()
                                        .array(arraySchemaBuilder()
                                            .schema(schemaBuilder()
                                                .implementation(Accountability.class)))))
                            .response(
                                responseBuilder()
                                    .responseCode("200").description(
                                        "The accountabilities records were successfully updated")
                                    .implementation(Accountability.class))
                            .response(
                                responseBuilder()
                                    .responseCode("500").description(
                                        "An unexpected condition was encountered while updating the accountabilities records")
                                    .implementation(String.class)))
                    .build())

                .and(route()
                    .PUT("/api/v1/accountabilities/{database}/entity/{entityId}/name",
                        accept(APPLICATION_JSON).and(contentType(APPLICATION_JSON)),
                        handler::updateAccountabilitiesEntityNames,
                        ops -> ops
                            .tag("Update")
                            .operationId("updateAccountabilitiesEntityNames")
                            .beanClass(AccountabilitiesHandler.class)
                            .beanMethod("updateAccountabilitiesEntityNames")
                            .description(
                                "Updates the names of the commissioning or responsible entities in accountabilitys records")
                            .parameter(
                                parameterBuilder()
                                    .name("database").in(ParameterIn.PATH)
                                    .description(
                                        "The name of the database within which the accountability record should be updated")
                                    .implementation(String.class))
                            .parameter(
                                parameterBuilder()
                                    .name("entityId").in(ParameterIn.PATH)
                                    .description(
                                        "The unique identifier of the entity type whose names need to be updated")
                                    .implementation(Long.class))
                            .response(
                                responseBuilder()
                                    .responseCode("200").description(
                                        "The accountability record was successfully updated")
                                    .implementation(Accountability.class))
                            .response(
                                responseBuilder()
                                    .responseCode("500").description(
                                        "An unexpected condition was encountered while updating the accountability record")
                                    .implementation(String.class)))
                    .build())

                .and(route()
                    .DELETE("/api/v1/accountabilities/{database}/ids/{id}",
                        accept(APPLICATION_JSON),
                        handler::deleteAccountability,
                        ops -> ops
                            .tag("Delete")
                            .operationId("deleteAccountability")
                            .beanClass(AccountabilitiesHandler.class)
                            .beanMethod("deleteAccountability")
                            .description(
                                "Deletes a single accountability record from the database given its unique identifier")
                            .parameter(
                                parameterBuilder()
                                    .name("database").in(ParameterIn.PATH)
                                    .description(
                                        "The name of the database from which the accountability record should be deleted")
                                    .implementation(String.class))
                            .parameter(
                                parameterBuilder()
                                    .name("id").in(ParameterIn.PATH)
                                    .description(
                                        "The unique identifier of the desired accountability record")
                                    .implementation(Long.class))
                            .response(
                                responseBuilder()
                                    .responseCode("200").description(
                                        "The accountability record was successfully deleted")
                                    .implementation(Integer.class)
                                    .description(
                                        "The number of accountabilities records successfully deleted"))
                            .response(
                                responseBuilder()
                                    .responseCode("500").description(
                                        "An unexpected condition was encountered while deleting the accountability record")
                                    .implementation(String.class)))
                    .build())

                .and(route()
                    .DELETE("/api/v1/accountabilities/{database}/all",
                        accept(APPLICATION_JSON),
                        handler::deleteAccountabilities,
                        ops -> ops
                            .tag("Delete")
                            .operationId("deleteAccountabilities")
                            .beanClass(AccountabilitiesHandler.class)
                            .beanMethod("deleteAccountabilities")
                            .description(
                                "Deletes all or some of the accountabilities records from the database depending on whether or not query parameters were included in the query string")
                            .parameter(
                                parameterBuilder()
                                    .name("database").in(ParameterIn.PATH)
                                    .description(
                                        "The name of the database from which the accountabilities records should be deleted")
                                    .implementation(String.class))
                            .parameter(
                                parameterBuilder()
                                    .name("ids").in(ParameterIn.QUERY)
                                    .description(
                                        "The unique identifiers of the accountabilities records that should be included in the deletion")
                                    .implementation(Long.class))
                            .parameter(
                                parameterBuilder()
                                    .name("type").in(ParameterIn.QUERY)
                                    .description(
                                        "The unique identifier of the accountability type by which the accountabilities records to be deleted should be filtered")
                                    .implementation(Integer.class))
                            .parameter(
                                parameterBuilder()
                                    .name("commissioner").in(ParameterIn.QUERY)
                                    .description(
                                        "The unique identifier of the parent entity type by which the accountabilities records to be deleted should be filtered")
                                    .implementation(Integer.class))
                            .parameter(
                                parameterBuilder()
                                    .name("responsible").in(ParameterIn.QUERY)
                                    .description(
                                        "The unique identifier of the subsidiary entity type by which the accountabilities records to be deleted should be filtered")
                                    .implementation(Integer.class))
                            .response(
                                responseBuilder()
                                    .responseCode("200").description(
                                        "The accountabilities records were successfully deleted")
                                    .implementation(Integer.class)
                                    .description(
                                        "The number of accountabilities records successfully deleted"))
                            .response(
                                responseBuilder()
                                    .responseCode("500").description(
                                        "An unexpected condition was encountered while deleting the accountabilities records")
                                    .implementation(String.class)))
                    .build()));
  }

}
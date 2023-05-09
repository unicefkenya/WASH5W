/*
 * Copyright (C) 2021 Second Mile
 *
 * This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0.
 * If a copy of the MPL was not distributed with this file,
 * You can obtain one at http://mozilla.org/MPL/2.0/.
 */
package ke.co.miles.accountabilitieshierarchies.configurations;

import io.swagger.v3.oas.annotations.enums.ParameterIn;
import ke.co.miles.accountabilitieshierarchies.handlers.AccountabilitiesHierarchiesHandler;
import ke.co.miles.accountabilitieshierarchies.models.AccountabilityHierarchy;
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
    RouterFunction<ServerResponse> routeRequests(AccountabilitiesHierarchiesHandler handler) {

        return
                route()
                        .POST("/api/v1/accountabilities_hierarchies/{database}",
                                accept(APPLICATION_JSON).and(contentType(APPLICATION_JSON)),
                                handler::createAccountabilityHierarchy,
                                ops -> ops
                                        .tag("Create")
                                        .operationId("createAccountabilityHierarchy")
                                        .beanClass(AccountabilitiesHierarchiesHandler.class)
                                        .beanMethod("createAccountabilityHierarchy")
                                        .description("Inserts a single accountability hierarchy record into the database")
                                        .parameter(
                                                parameterBuilder()
                                                        .name("database").in(ParameterIn.PATH)
                                                        .description("The name of the database within which the accountability hierarchy record should be inserted")
                                                        .implementation(String.class))
                                        .requestBody(
                                                requestBodyBuilder()
                                                        .content(contentBuilder()
                                                                .schema(schemaBuilder()
                                                                        .implementation(AccountabilityHierarchy.class))))
                                        .response(
                                                responseBuilder()
                                                        .responseCode("201").description("The accountability hierarchy record was successfully created")
                                                        .implementation(AccountabilityHierarchy.class))
                                        .response(
                                                responseBuilder()
                                                        .responseCode("500").description("An unexpected condition was encountered while creating the accountability hierarchy record")
                                                        .implementation(String.class)))
                        .build()

                        .and(route()
                                .POST("/api/v1/accountabilities_hierarchies/{database}/all",
                                        accept(APPLICATION_JSON).and(contentType(APPLICATION_JSON)),
                                        handler::createAccountabilitiesHierarchies,
                                        ops -> ops
                                                .tag("Create")
                                                .operationId("createAccountabilitiesHierarchies")
                                                .beanClass(AccountabilitiesHierarchiesHandler.class)
                                                .beanMethod("createAccountabilitiesHierarchies")
                                                .description("Inserts several accountabilities hierarchies records into the database")
                                                .parameter(
                                                        parameterBuilder()
                                                                .name("database").in(ParameterIn.PATH)
                                                                .description("The name of the database within which the accountabilities hierarchies records should be inserted")
                                                                .implementation(String.class))
                                                .requestBody(
                                                        requestBodyBuilder()
                                                                .content(contentBuilder()
                                                                        .array(arraySchemaBuilder()
                                                                                .schema(schemaBuilder()
                                                                                        .implementation(AccountabilityHierarchy.class)))))

                                                .response(
                                                        responseBuilder()
                                                                .responseCode("201").description("The accountabilities hierarchies records were successfully created")
                                                                .implementationArray(AccountabilityHierarchy.class))

                                                .response(
                                                        responseBuilder()
                                                                .responseCode("500").description("An unexpected condition was encountered while creating the accountabilities hierarchies records")
                                                                .implementation(String.class)))
                                .build()

                                .and(route()
                                        .GET("/api/v1/accountabilities_hierarchies/{database}/ids/{id}",
                                                accept(APPLICATION_JSON),
                                                handler::retrieveAccountabilityHierarchy,
                                                ops -> ops
                                                        .tag("Retrieve")
                                                        .operationId("retrieveAccountabilityHierarchy")
                                                        .beanClass(AccountabilitiesHierarchiesHandler.class)
                                                        .beanMethod("retrieveAccountabilityHierarchy")
                                                        .description("Retrieves a single accountability hierarchy record from the database given its unique identifier")
                                                        .parameter(
                                                                parameterBuilder()
                                                                        .name("database").in(ParameterIn.PATH)
                                                                        .description("The name of the database from which the accountability hierarchy record should be retrieved")
                                                                        .implementation(String.class))
                                                        .parameter(
                                                                parameterBuilder()
                                                                        .name("id").in(ParameterIn.PATH)
                                                                        .description("The unique identifier of the accountability hierarchy record that should be retrieved")
                                                                        .implementation(Long.class))
                                                        .response(
                                                                responseBuilder()
                                                                        .responseCode("200").description("The accountability hierarchy record was successfully retrieved")
                                                                        .implementation(AccountabilityHierarchy.class))
                                                        .response(
                                                                responseBuilder()
                                                                        .responseCode("500").description("An unexpected condition was encountered while retrieving the accountability hierarchy record")
                                                                        .implementation(String.class)))
                                        .build())

                                .and(route()
                                        .GET("/api/v1/accountabilities_hierarchies/{database}/all",
                                                accept(APPLICATION_JSON),
                                                handler::retrieveAccountabilitiesHierarchies,
                                                ops -> ops
                                                        .tag("Retrieve")
                                                        .operationId("retrieveAccountabilitiesHierarchies")
                                                        .beanClass(AccountabilitiesHierarchiesHandler.class)
                                                        .beanMethod("retrieveAccountabilitiesHierarchies")
                                                        .description("Retrieves all or some of the accountabilities hierarchies records from the database depending on whether query parameters were included in the query string")
                                                        .parameter(
                                                                parameterBuilder()
                                                                        .name("database").in(ParameterIn.PATH)
                                                                        .description("The name of the database from which the accountabilities hierarchies records should be retrieved")
                                                                        .implementation(String.class))
                                                        .parameter(
                                                                parameterBuilder()
                                                                        .name("ids").in(ParameterIn.QUERY)
                                                                        .description("The unique identifiers of the accountabilities hierarchies records that should be retrieved")
                                                                        .implementation(Long.class))
                                                        .parameter(
                                                                parameterBuilder()
                                                                        .name("limit").in(ParameterIn.QUERY)
                                                                        .description("The maximum number of Data AccountabilityHierarchy Records to return")
                                                                        .implementation(Integer.class))
                                                        .parameter(
                                                                parameterBuilder()
                                                                        .name("offset").in(ParameterIn.QUERY)
                                                                        .description("The starting point from which Data AccountabilityHierarchy Records should be returned")
                                                                        .implementation(Integer.class))
                                                        .response(
                                                                responseBuilder()
                                                                        .responseCode("200").description("The accountabilities hierarchies records were successfully retrieved")
                                                                        .implementationArray(AccountabilityHierarchy.class))
                                                        .response(
                                                                responseBuilder()
                                                                        .responseCode("500").description("An unexpected condition was encountered while retrieving the accountabilities hierarchies records")
                                                                        .implementation(String.class)))
                                        .build())
                                .and(route()
                                        .GET("/api/v1/accountabilities_hierarchies/{database}/total",
                                                accept(APPLICATION_JSON),
                                                handler::retrieveTotalAccountabilitiesHierarchies,
                                                ops -> ops
                                                        .tag("Retrieve")
                                                        .operationId("retrieveTotalAccountabilitiesHierarchies")
                                                        .beanClass(AccountabilitiesHierarchiesHandler.class)
                                                        .beanMethod("retrieveTotalAccountabilitiesHierarchies")
                                                        .description("Retrieves the estimated or actual count of accountabilities hierarchies records from the database given a specific query and its parameters")
                                                        .parameter(
                                                                parameterBuilder()
                                                                        .name("database").in(ParameterIn.PATH)
                                                                        .description("The name of the database from which the accountabilities hierarchies records count should be made")
                                                                        .implementation(String.class))
                                                        .parameter(
                                                                parameterBuilder()
                                                                        .name("ids").in(ParameterIn.QUERY)
                                                                        .description("The unique identifiers of the accountabilities hierarchies records that should be included in the count")
                                                                        .implementation(Long.class))
                                                        .response(
                                                                responseBuilder()
                                                                        .responseCode("200").description("The accountabilities hierarchies records were successfully retrieved")
                                                                        .implementationArray(AccountabilityHierarchy.class))
                                                        .response(
                                                                responseBuilder()
                                                                        .responseCode("500").description("An unexpected condition was encountered while retrieving the accountabilities hierarchies records")
                                                                        .implementation(String.class)))
                                        .build())

                                .and(route()
                                        .PUT("/api/v1/accountabilities_hierarchies/{database}",
                                                accept(APPLICATION_JSON).and(contentType(APPLICATION_JSON)),
                                                handler::updateAccountabilityHierarchy,
                                                ops -> ops
                                                        .tag("Update")
                                                        .operationId("updateAccountabilityHierarchy")
                                                        .beanClass(AccountabilitiesHierarchiesHandler.class)
                                                        .beanMethod("updateAccountabilityHierarchy")
                                                        .description("Updates a single accountability hierarchy record in the database")
                                                        .parameter(
                                                                parameterBuilder()
                                                                        .name("database").in(ParameterIn.PATH)
                                                                        .description("The name of the database within which the accountability hierarchy record should be updated")
                                                                        .implementation(String.class))
                                                        .response(
                                                                responseBuilder()
                                                                        .responseCode("200").description("The accountability hierarchy record was successfully updated")
                                                                        .implementation(AccountabilityHierarchy.class))
                                                        .response(
                                                                responseBuilder()
                                                                        .responseCode("500").description("An unexpected condition was encountered while updating the accountability hierarchy record")
                                                                        .implementation(String.class)))
                                        .build())

                                .and(route()
                                        .PUT("/api/v1/accountabilities_hierarchies/{database}/all",
                                                accept(APPLICATION_JSON).and(contentType(APPLICATION_JSON)),
                                                handler::updateAccountabilitiesHierarchies,
                                                ops -> ops
                                                        .tag("Update")
                                                        .operationId("updateAccountabilityHierarchy")
                                                        .beanClass(AccountabilitiesHierarchiesHandler.class)
                                                        .beanMethod("updateAccountabilitiesHierarchies")
                                                        .description("Updates several accountabilities hierarchies records in the database")
                                                        .parameter(
                                                                parameterBuilder()
                                                                        .name("database").in(ParameterIn.PATH)
                                                                        .description("The name of the database within which the accountabilities hierarchies records should be updated")
                                                                        .implementation(String.class))
                                                        .requestBody(
                                                                requestBodyBuilder()
                                                                        .content(contentBuilder()
                                                                                .array(arraySchemaBuilder()
                                                                                        .schema(schemaBuilder()
                                                                                                .implementation(AccountabilityHierarchy.class)))))
                                                        .response(
                                                                responseBuilder()
                                                                        .responseCode("200").description("The accountabilities hierarchies records were successfully updated")
                                                                        .implementation(AccountabilityHierarchy.class))
                                                        .response(
                                                                responseBuilder()
                                                                        .responseCode("500").description("An unexpected condition was encountered while updating the accountabilities hierarchies records")
                                                                        .implementation(String.class)))
                                        .build())

                                .and(route()
                                        .DELETE("/api/v1/accountabilities_hierarchies/{database}/ids/{id}",
                                                accept(APPLICATION_JSON),
                                                handler::deleteAccountabilityHierarchy,
                                                ops -> ops
                                                        .tag("Delete")
                                                        .operationId("deleteAccountabilityHierarchy")
                                                        .beanClass(AccountabilitiesHierarchiesHandler.class)
                                                        .beanMethod("deleteAccountabilityHierarchy")
                                                        .description("Deletes a single accountability hierarchy record from the database given its unique identifier")
                                                        .parameter(
                                                                parameterBuilder()
                                                                        .name("database").in(ParameterIn.PATH)
                                                                        .description("The name of the database from which the accountability hierarchy record should be deleted")
                                                                        .implementation(String.class))
                                                        .parameter(
                                                                parameterBuilder()
                                                                        .name("id").in(ParameterIn.PATH)
                                                                        .description("The unique identifier of the desired accountability hierarchy record")
                                                                        .implementation(Long.class))
                                                        .response(
                                                                responseBuilder()
                                                                        .responseCode("200").description("The accountability hierarchy record was successfully deleted")
                                                                        .implementation(Integer.class)
                                                                        .description("The number of accountabilities hierarchies records successfully deleted"))
                                                        .response(
                                                                responseBuilder()
                                                                        .responseCode("500").description("An unexpected condition was encountered while deleting the accountability hierarchy record")
                                                                        .implementation(String.class)))
                                        .build())

                                .and(route()
                                        .DELETE("/api/v1/accountabilities_hierarchies/{database}/all",
                                                accept(APPLICATION_JSON),
                                                handler::deleteAccountabilitiesHierarchies,
                                                ops -> ops
                                                        .tag("Delete")
                                                        .operationId("deleteAccountabilitiesHierarchies")
                                                        .beanClass(AccountabilitiesHierarchiesHandler.class)
                                                        .beanMethod("deleteAccountabilitiesHierarchies")
                                                        .description("Deletes all or some of the accountabilities hierarchies records from the database depending on whether or not query parameters were included in the query string")
                                                        .parameter(
                                                                parameterBuilder()
                                                                        .name("database").in(ParameterIn.PATH)
                                                                        .description("The name of the database from which the accountabilities hierarchies records should be deleted")
                                                                        .implementation(String.class))
                                                        .parameter(
                                                                parameterBuilder()
                                                                        .name("ids").in(ParameterIn.QUERY)
                                                                        .description("The unique identifiers of the accountabilities hierarchies records that should be included in the deletion")
                                                                        .implementation(Long.class))
                                                        .response(
                                                                responseBuilder()
                                                                        .responseCode("200").description("The accountabilities hierarchies records were successfully deleted")
                                                                        .implementation(Integer.class)
                                                                        .description("The number of accountabilities hierarchies records successfully deleted"))
                                                        .response(
                                                                responseBuilder()
                                                                        .responseCode("500").description("An unexpected condition was encountered while deleting the accountabilities hierarchies records")
                                                                        .implementation(String.class)))
                                        .build()));
    }

}
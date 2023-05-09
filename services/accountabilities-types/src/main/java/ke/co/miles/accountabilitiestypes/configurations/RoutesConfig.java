/*
 * Copyright (C) 2021 Second Mile
 *
 * This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0.
 * If a copy of the MPL was not distributed with this file,
 * You can obtain one at http://mozilla.org/MPL/2.0/.
 */
package ke.co.miles.accountabilitiestypes.configurations;

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
import ke.co.miles.accountabilitiestypes.handlers.AccountabilitiesTypesHandler;
import ke.co.miles.accountabilitiestypes.models.AccountabilityType;
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
  RouterFunction<ServerResponse> routeRequests(AccountabilitiesTypesHandler handler) {

    return
        route()
            .POST("/api/v1/accountabilities_types/{database}",
                accept(APPLICATION_JSON).and(contentType(APPLICATION_JSON)),
                handler::createAccountabilityType,
                ops -> ops
                    .tag("Create")
                    .operationId("createAccountabilityType")
                    .beanClass(AccountabilitiesTypesHandler.class)
                    .beanMethod("createAccountabilityType")
                    .description("Inserts a single accountability type record into the database")
                    .parameter(
                        parameterBuilder()
                            .name("database").in(ParameterIn.PATH)
                            .description(
                                "The name of the database within which the accountability type record should be inserted")
                            .implementation(String.class))
                    .requestBody(
                        requestBodyBuilder()
                            .content(contentBuilder()
                                .schema(schemaBuilder()
                                    .implementation(AccountabilityType.class))))
                    .response(
                        responseBuilder()
                            .responseCode("201")
                            .description("The accountability type record was successfully created")
                            .implementation(AccountabilityType.class))
                    .response(
                        responseBuilder()
                            .responseCode("500").description(
                                "An unexpected condition was encountered while creating the accountability type record")
                            .implementation(String.class)))
            .build()

            .and(route()
                .POST("/api/v1/accountabilities_types/{database}/all",
                    accept(APPLICATION_JSON).and(contentType(APPLICATION_JSON)),
                    handler::createAccountabilitiesTypes,
                    ops -> ops
                        .tag("Create")
                        .operationId("createAccountabilitiesTypes")
                        .beanClass(AccountabilitiesTypesHandler.class)
                        .beanMethod("createAccountabilitiesTypes")
                        .description(
                            "Inserts several accountabilities types records into the database")
                        .parameter(
                            parameterBuilder()
                                .name("database").in(ParameterIn.PATH)
                                .description(
                                    "The name of the database within which the accountabilities types records should be inserted")
                                .implementation(String.class))
                        .requestBody(
                            requestBodyBuilder()
                                .content(contentBuilder()
                                    .array(arraySchemaBuilder()
                                        .schema(schemaBuilder()
                                            .implementation(AccountabilityType.class)))))

                        .response(
                            responseBuilder()
                                .responseCode("201").description(
                                    "The accountabilities types records were successfully created")
                                .implementationArray(AccountabilityType.class))

                        .response(
                            responseBuilder()
                                .responseCode("500").description(
                                    "An unexpected condition was encountered while creating the accountabilities types records")
                                .implementation(String.class)))
                .build()

                .and(route()
                    .GET("/api/v1/accountabilities_types/{database}/ids/{id}",
                        accept(APPLICATION_JSON),
                        handler::retrieveAccountabilityType,
                        ops -> ops
                            .tag("Retrieve")
                            .operationId("retrieveAccountabilityType")
                            .beanClass(AccountabilitiesTypesHandler.class)
                            .beanMethod("retrieveAccountabilityType")
                            .description(
                                "Retrieves a single accountability type record from the database given its unique identifier")
                            .parameter(
                                parameterBuilder()
                                    .name("database").in(ParameterIn.PATH)
                                    .description(
                                        "The name of the database from which the accountability type record should be retrieved")
                                    .implementation(String.class))
                            .parameter(
                                parameterBuilder()
                                    .name("id").in(ParameterIn.PATH)
                                    .description(
                                        "The unique identifier of the accountability type record that should be retrieved")
                                    .implementation(Long.class))
                            .response(
                                responseBuilder()
                                    .responseCode("200").description(
                                        "The accountability type record was successfully retrieved")
                                    .implementation(AccountabilityType.class))
                            .response(
                                responseBuilder()
                                    .responseCode("500").description(
                                        "An unexpected condition was encountered while retrieving the accountability type record")
                                    .implementation(String.class)))
                    .build())

                .and(route()
                    .GET("/api/v1/accountabilities_types/{database}/all",
                        accept(APPLICATION_JSON),
                        handler::retrieveAccountabilitiesTypes,
                        ops -> ops
                            .tag("Retrieve")
                            .operationId("retrieveAccountabilitiesTypes")
                            .beanClass(AccountabilitiesTypesHandler.class)
                            .beanMethod("retrieveAccountabilitiesTypes")
                            .description(
                                "Retrieves all or some of the accountabilities types records from the database depending on whether query parameters were included in the query string")
                            .parameter(
                                parameterBuilder()
                                    .name("database").in(ParameterIn.PATH)
                                    .description(
                                        "The name of the database from which the accountabilities types records should be retrieved")
                                    .implementation(String.class))
                            .parameter(
                                parameterBuilder()
                                    .name("ids").in(ParameterIn.QUERY)
                                    .description(
                                        "The unique identifiers of the accountabilities types records that should be retrieved")
                                    .implementation(Long.class))
                            .parameter(
                                parameterBuilder()
                                    .name("hierarchyId").in(ParameterIn.QUERY)
                                    .description(
                                        "The unique identifier of the administrative hierarchy by which the retrieved accountabilities types records should be filtered")
                                    .implementation(Integer.class))
                            .parameter(
                                parameterBuilder()
                                    .name("commissionerId").in(ParameterIn.QUERY)
                                    .description(
                                        "The unique identifier of the parent entity type by which the retrieved accountabilities types records should be filtered")
                                    .implementation(Integer.class))
                            .parameter(
                                parameterBuilder()
                                    .name("responsibleId").in(ParameterIn.QUERY)
                                    .description(
                                        "The unique identifier of the subsidiary entity type by which the retrieved accountabilities types records should be filtered")
                                    .implementation(Integer.class))
                            .parameter(
                                parameterBuilder()
                                    .name("limit").in(ParameterIn.QUERY)
                                    .description(
                                        "The maximum number of accountabilities types records to return")
                                    .implementation(Integer.class))
                            .parameter(
                                parameterBuilder()
                                    .name("offset").in(ParameterIn.QUERY)
                                    .description(
                                        "The starting point from which accountabilities types records should be retrieved")
                                    .implementation(Integer.class))
                            .response(
                                responseBuilder()
                                    .responseCode("200").description(
                                        "The accountabilities types records were successfully retrieved")
                                    .implementationArray(AccountabilityType.class))
                            .response(
                                responseBuilder()
                                    .responseCode("500").description(
                                        "An unexpected condition was encountered while retrieving the accountabilities types records")
                                    .implementation(String.class)))
                    .build())

                .and(route()
                    .GET(
                        "/api/v1/accountabilities_types/{database}/descendants/hierarchy/{hierarchy}/commissioner/{commissioner}",
                        accept(APPLICATION_JSON),
                        handler::retrieveDescendantAccountabilitiesTypes,
                        ops -> ops
                            .tag("Retrieve")
                            .operationId("retrieveDescendantAccountabilitiesTypes")
                            .beanClass(AccountabilitiesTypesHandler.class)
                            .beanMethod("retrieveDescendantAccountabilitiesTypes")
                            .description(
                                "Retrieves descendant accountabilities types records from the database depending on whether path / query parameters were included in the query string")
                            .parameter(
                                parameterBuilder()
                                    .name("database").in(ParameterIn.PATH)
                                    .description(
                                        "The name of the database from which the accountabilities types records should be retrieved")
                                    .implementation(String.class))
                            .parameter(
                                parameterBuilder()
                                    .name("hierarchyId").in(ParameterIn.PATH)
                                    .description(
                                        "The unique identifier of the administrative hierarchy whose descendant accountabilities types records should be retrieved")
                                    .implementation(Integer.class))
                            .parameter(
                                parameterBuilder()
                                    .name("commissionerId").in(ParameterIn.PATH)
                                    .description(
                                        "The unique identifier of the parent entity type whose descendant accountabilities types records should be retrieved")
                                    .implementation(Integer.class))
                            .parameter(
                                parameterBuilder()
                                    .name("level").in(ParameterIn.QUERY)
                                    .description(
                                        "The hierarchical level of the descendant accountabilities types records to return")
                                    .implementation(Integer.class))
                            .parameter(
                                parameterBuilder()
                                    .name("levelLT").in(ParameterIn.QUERY)
                                    .description(
                                        "The maximum hierarchical level of the descendant accountabilities types records to return")
                                    .implementation(Integer.class))
                            .parameter(
                                parameterBuilder()
                                    .name("levelLTE").in(ParameterIn.QUERY)
                                    .description(
                                        "The maximum hierarchical level (inclusive) of the descendant accountabilities types records to return")
                                    .implementation(Integer.class))
                            .parameter(
                                parameterBuilder()
                                    .name("levelGT").in(ParameterIn.QUERY)
                                    .description(
                                        "The minimum hierarchical level of the descendant accountabilities types records to return")
                                    .implementation(Integer.class))
                            .parameter(
                                parameterBuilder()
                                    .name("levelGTE").in(ParameterIn.QUERY)
                                    .description(
                                        "The minimum hierarchical level (inclusive) of the descendant accountabilities types records to return")
                                    .implementation(Integer.class))
                            .parameter(
                                parameterBuilder()
                                    .name("limit").in(ParameterIn.QUERY)
                                    .description(
                                        "The maximum number of accountabilities types records to retrieve")
                                    .implementation(Integer.class))
                            .parameter(
                                parameterBuilder()
                                    .name("offset").in(ParameterIn.QUERY)
                                    .description(
                                        "The starting point from which accountabilities types records should be retrieved")
                                    .implementation(Integer.class))
                            .response(
                                responseBuilder()
                                    .responseCode("200").description(
                                        "The accountabilities types records were successfully retrieved")
                                    .implementationArray(AccountabilityType.class))
                            .response(
                                responseBuilder()
                                    .responseCode("500").description(
                                        "An unexpected condition was encountered while retrieving the accountabilities types records")
                                    .implementation(String.class)))
                    .build())
                .and(route()
                    .GET(
                        "/api/v1/accountabilities_types/{database}/ascendants/hierarchy/{hierarchy}/responsible/{responsible}",
                        accept(APPLICATION_JSON),
                        handler::retrieveAscendantAccountabilitiesTypes,
                        ops -> ops
                            .tag("Retrieve")
                            .operationId("retrieveAscendantAccountabilitiesTypes")
                            .beanClass(AccountabilitiesTypesHandler.class)
                            .beanMethod("retrieveAscendantAccountabilitiesTypes")
                            .description(
                                "Retrieves ascendant accountabilities types records from the database depending on whether path / query parameters were included in the query string")
                            .parameter(
                                parameterBuilder()
                                    .name("database").in(ParameterIn.PATH)
                                    .description(
                                        "The name of the database from which the accountabilities types records should be retrieved")
                                    .implementation(String.class))
                            .parameter(
                                parameterBuilder()
                                    .name("hierarchyId").in(ParameterIn.PATH)
                                    .description(
                                        "The unique identifier of the administrative hierarchy whose ascendant accountabilities types records should be retrieved")
                                    .implementation(Integer.class))
                            .parameter(
                                parameterBuilder()
                                    .name("responsibleId").in(ParameterIn.PATH)
                                    .description(
                                        "The unique identifier of the subsidiary entity type whose ascendant accountabilities types records should be retrieved")
                                    .implementation(Integer.class))
                            .parameter(
                                parameterBuilder()
                                    .name("level").in(ParameterIn.QUERY)
                                    .description(
                                        "The hierarchical level of the ascendant accountabilities types records to return")
                                    .implementation(Integer.class))
                            .parameter(
                                parameterBuilder()
                                    .name("levelLT").in(ParameterIn.QUERY)
                                    .description(
                                        "The maximum hierarchical level of the ascendant accountabilities types records to return")
                                    .implementation(Integer.class))
                            .parameter(
                                parameterBuilder()
                                    .name("levelLTE").in(ParameterIn.QUERY)
                                    .description(
                                        "The maximum hierarchical level (inclusive) of the ascendant accountabilities types records to return")
                                    .implementation(Integer.class))
                            .parameter(
                                parameterBuilder()
                                    .name("levelGT").in(ParameterIn.QUERY)
                                    .description(
                                        "The minimum hierarchical level of the ascendant accountabilities types records to return")
                                    .implementation(Integer.class))
                            .parameter(
                                parameterBuilder()
                                    .name("levelGTE").in(ParameterIn.QUERY)
                                    .description(
                                        "The minimum hierarchical level (inclusive) of the ascendant accountabilities types records to return")
                                    .implementation(Integer.class))
                            .parameter(
                                parameterBuilder()
                                    .name("limit").in(ParameterIn.QUERY)
                                    .description(
                                        "The maximum number of accountabilities types records to retrieve")
                                    .implementation(Integer.class))
                            .parameter(
                                parameterBuilder()
                                    .name("offset").in(ParameterIn.QUERY)
                                    .description(
                                        "The starting point from which accountabilities types records should be retrieved")
                                    .implementation(Integer.class))
                            .response(
                                responseBuilder()
                                    .responseCode("200").description(
                                        "The accountabilities types records were successfully retrieved")
                                    .implementationArray(AccountabilityType.class))
                            .response(
                                responseBuilder()
                                    .responseCode("500").description(
                                        "An unexpected condition was encountered while retrieving the accountabilities types records")
                                    .implementation(String.class)))
                    .build())

                .and(route()
                    .GET("/api/v1/accountabilities_types/{database}/total",
                        accept(APPLICATION_JSON),
                        handler::retrieveTotalAccountabilitiesTypes,
                        ops -> ops
                            .tag("Retrieve")
                            .operationId("retrieveTotalAccountabilitiesTypes")
                            .beanClass(AccountabilitiesTypesHandler.class)
                            .beanMethod("retrieveTotalAccountabilitiesTypes")
                            .description(
                                "Retrieves the estimated or actual count of accountabilities types records from the database given a specific query and its parameters")
                            .parameter(
                                parameterBuilder()
                                    .name("database").in(ParameterIn.PATH)
                                    .description(
                                        "The name of the database from which the accountabilities types records count should be made")
                                    .implementation(String.class))
                            .parameter(
                                parameterBuilder()
                                    .name("ids").in(ParameterIn.QUERY)
                                    .description(
                                        "The unique identifiers of the accountabilities types records that should be included in the count")
                                    .implementation(Long.class))
                            .response(
                                responseBuilder()
                                    .responseCode("200").description(
                                        "The accountabilities types records were successfully retrieved")
                                    .implementationArray(AccountabilityType.class))
                            .response(
                                responseBuilder()
                                    .responseCode("500").description(
                                        "An unexpected condition was encountered while retrieving the accountabilities types records")
                                    .implementation(String.class)))
                    .build())

                .and(route()
                    .PUT("/api/v1/accountabilities_types/{database}",
                        accept(APPLICATION_JSON).and(contentType(APPLICATION_JSON)),
                        handler::updateAccountabilityType,
                        ops -> ops
                            .tag("Update")
                            .operationId("updateAccountabilityType")
                            .beanClass(AccountabilitiesTypesHandler.class)
                            .beanMethod("updateAccountabilityType")
                            .description(
                                "Updates a single accountability type record in the database")
                            .parameter(
                                parameterBuilder()
                                    .name("database").in(ParameterIn.PATH)
                                    .description(
                                        "The name of the database within which the accountability type record should be updated")
                                    .implementation(String.class))
                            .response(
                                responseBuilder()
                                    .responseCode("200").description(
                                        "The accountability type record was successfully updated")
                                    .implementation(AccountabilityType.class))
                            .response(
                                responseBuilder()
                                    .responseCode("500").description(
                                        "An unexpected condition was encountered while updating the accountability type record")
                                    .implementation(String.class)))
                    .build())

                .and(route()
                    .PUT("/api/v1/accountabilities_types/{database}/all",
                        accept(APPLICATION_JSON).and(contentType(APPLICATION_JSON)),
                        handler::updateAccountabilitiesTypes,
                        ops -> ops
                            .tag("Update")
                            .operationId("updateAccountabilityType")
                            .beanClass(AccountabilitiesTypesHandler.class)
                            .beanMethod("updateAccountabilitiesTypes")
                            .description(
                                "Updates several accountabilities types records in the database")
                            .parameter(
                                parameterBuilder()
                                    .name("database").in(ParameterIn.PATH)
                                    .description(
                                        "The name of the database within which the accountabilities types records should be updated")
                                    .implementation(String.class))
                            .requestBody(
                                requestBodyBuilder()
                                    .content(contentBuilder()
                                        .array(arraySchemaBuilder()
                                            .schema(schemaBuilder()
                                                .implementation(AccountabilityType.class)))))
                            .response(
                                responseBuilder()
                                    .responseCode("200").description(
                                        "The accountabilities types records were successfully updated")
                                    .implementation(AccountabilityType.class))
                            .response(
                                responseBuilder()
                                    .responseCode("500").description(
                                        "An unexpected condition was encountered while updating the accountabilities types records")
                                    .implementation(String.class)))
                    .build())

                .and(route()
                    .PUT("/api/v1/accountabilities_types/{database}/entity/{entityId}/name",
                        accept(APPLICATION_JSON).and(contentType(APPLICATION_JSON)),
                        handler::updateAccountabilitiesTypesEntityNames,
                        ops -> ops
                            .tag("Update")
                            .operationId("updateAccountabilitiesTypesEntityNames")
                            .beanClass(AccountabilitiesTypesHandler.class)
                            .beanMethod("updateAccountabilitiesTypesEntityNames")
                            .description(
                                "Updates the names of the commissioning or responsible entities in accountability types records")
                            .parameter(
                                parameterBuilder()
                                    .name("database").in(ParameterIn.PATH)
                                    .description(
                                        "The name of the database within which the accountability type record should be updated")
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
                                        "The accountability type record was successfully updated")
                                    .implementation(AccountabilityType.class))
                            .response(
                                responseBuilder()
                                    .responseCode("500").description(
                                        "An unexpected condition was encountered while updating the accountability type record")
                                    .implementation(String.class)))
                    .build())

                .and(route()
                    .DELETE("/api/v1/accountabilities_types/{database}/ids/{id}",
                        accept(APPLICATION_JSON),
                        handler::deleteAccountabilityType,
                        ops -> ops
                            .tag("Delete")
                            .operationId("deleteAccountabilityType")
                            .beanClass(AccountabilitiesTypesHandler.class)
                            .beanMethod("deleteAccountabilityType")
                            .description(
                                "Deletes a single accountability type record from the database given its unique identifier")
                            .parameter(
                                parameterBuilder()
                                    .name("database").in(ParameterIn.PATH)
                                    .description(
                                        "The name of the database from which the accountability type record should be deleted")
                                    .implementation(String.class))
                            .parameter(
                                parameterBuilder()
                                    .name("id").in(ParameterIn.PATH)
                                    .description(
                                        "The unique identifier of the desired accountability type record")
                                    .implementation(Long.class))
                            .response(
                                responseBuilder()
                                    .responseCode("200").description(
                                        "The accountability type record was successfully deleted")
                                    .implementation(Integer.class)
                                    .description(
                                        "The number of accountabilities types records successfully deleted"))
                            .response(
                                responseBuilder()
                                    .responseCode("500").description(
                                        "An unexpected condition was encountered while deleting the accountability type record")
                                    .implementation(String.class)))
                    .build())

                .and(route()
                    .DELETE("/api/v1/accountabilities_types/{database}/all",
                        accept(APPLICATION_JSON),
                        handler::deleteAccountabilitiesTypes,
                        ops -> ops
                            .tag("Delete")
                            .operationId("deleteAccountabilitiesTypes")
                            .beanClass(AccountabilitiesTypesHandler.class)
                            .beanMethod("deleteAccountabilitiesTypes")
                            .description(
                                "Deletes all or some of the accountabilities types records from the database depending on whether or not query parameters were included in the query string")
                            .parameter(
                                parameterBuilder()
                                    .name("database").in(ParameterIn.PATH)
                                    .description(
                                        "The name of the database from which the accountabilities types records should be deleted")
                                    .implementation(String.class))
                            .parameter(
                                parameterBuilder()
                                    .name("ids").in(ParameterIn.QUERY)
                                    .description(
                                        "The unique identifiers of the accountabilities types records that should be included in the deletion")
                                    .implementation(Long.class))
                            .parameter(
                                parameterBuilder()
                                    .name("hierarchy").in(ParameterIn.QUERY)
                                    .description(
                                        "The unique identifier of the administrative hierarchy by which the accountabilities types records to be deleted should be filtered")
                                    .implementation(Integer.class))
                            .parameter(
                                parameterBuilder()
                                    .name("commissioner").in(ParameterIn.QUERY)
                                    .description(
                                        "The unique identifier of the parent entity type by which the accountabilities types records to be deleted should be filtered")
                                    .implementation(Integer.class))
                            .parameter(
                                parameterBuilder()
                                    .name("responsible").in(ParameterIn.QUERY)
                                    .description(
                                        "The unique identifier of the subsidiary entity type by which the accountabilities types records to be deleted should be filtered")
                                    .implementation(Integer.class))
                            .response(
                                responseBuilder()
                                    .responseCode("200").description(
                                        "The accountabilities types records were successfully deleted")
                                    .implementation(Integer.class)
                                    .description(
                                        "The number of accountabilities types records successfully deleted"))
                            .response(
                                responseBuilder()
                                    .responseCode("500").description(
                                        "An unexpected condition was encountered while deleting the accountabilities types records")
                                    .implementation(String.class)))
                    .build()));
  }

}
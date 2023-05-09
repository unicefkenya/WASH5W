/*
 * Copyright (C) 2021 Second Mile
 *
 * This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0.
 * If a copy of the MPL was not distributed with this file,
 * You can obtain one at http://mozilla.org/MPL/2.0/.
 */
package ke.co.miles.types.configurations;

import io.swagger.v3.oas.annotations.enums.ParameterIn;
import ke.co.miles.types.handlers.TypesHandler;
import ke.co.miles.types.models.Type;
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
    RouterFunction<ServerResponse> routeRequests(TypesHandler handler) {

        return
                route()
                        .POST("/api/v1/types/{database}",
                                accept(APPLICATION_JSON).and(contentType(APPLICATION_JSON)),
                                handler::createType,
                                ops -> ops
                                        .tag("Create")
                                        .operationId("createType")
                                        .beanClass(TypesHandler.class)
                                        .beanMethod("createType")
                                        .description("Inserts a single type record into the database")
                                        .parameter(
                                                parameterBuilder()
                                                        .name("database").in(ParameterIn.PATH)
                                                        .description("The name of the database within which the type record should be inserted")
                                                        .implementation(String.class))
                                        .requestBody(
                                                requestBodyBuilder()
                                                        .content(contentBuilder()
                                                                .schema(schemaBuilder()
                                                                        .implementation(Type.class))))
                                        .response(
                                                responseBuilder()
                                                        .responseCode("201").description("The type record was successfully created")
                                                        .implementation(Type.class))
                                        .response(
                                                responseBuilder()
                                                        .responseCode("500").description("An unexpected condition was encountered while creating the type record")
                                                        .implementation(String.class)))
                        .build()

                        .and(route()
                                .POST("/api/v1/types/{database}/all",
                                        accept(APPLICATION_JSON).and(contentType(APPLICATION_JSON)),
                                        handler::createTypes,
                                        ops -> ops
                                                .tag("Create")
                                                .operationId("createTypes")
                                                .beanClass(TypesHandler.class)
                                                .beanMethod("createTypes")
                                                .description("Inserts several type records into the database")
                                                .parameter(
                                                        parameterBuilder()
                                                                .name("database").in(ParameterIn.PATH)
                                                                .description("The name of the database within which the type records should be inserted")
                                                                .implementation(String.class))
                                                .requestBody(
                                                        requestBodyBuilder()
                                                                .content(contentBuilder()
                                                                        .array(arraySchemaBuilder()
                                                                                .schema(schemaBuilder()
                                                                                        .implementation(Type.class)))))

                                                .response(
                                                        responseBuilder()
                                                                .responseCode("201").description("The type records were successfully created")
                                                                .implementationArray(Type.class))

                                                .response(
                                                        responseBuilder()
                                                                .responseCode("500").description("An unexpected condition was encountered while creating the type records")
                                                                .implementation(String.class)))
                                .build()

                                .and(route()
                                        .GET("/api/v1/types/{database}/ids/{id}",
                                                accept(APPLICATION_JSON),
                                                handler::retrieveType,
                                                ops -> ops
                                                        .tag("Retrieve")
                                                        .operationId("retrieveType")
                                                        .beanClass(TypesHandler.class)
                                                        .beanMethod("retrieveType")
                                                        .description("Retrieves a single type record from the database given its unique identifier")
                                                        .parameter(
                                                                parameterBuilder()
                                                                        .name("database").in(ParameterIn.PATH)
                                                                        .description("The name of the database from which the type record should be retrieved")
                                                                        .implementation(String.class))
                                                        .parameter(
                                                                parameterBuilder()
                                                                        .name("id").in(ParameterIn.PATH)
                                                                        .description("The unique identifier of the type record that should be retrieved")
                                                                        .implementation(Long.class))
                                                        .response(
                                                                responseBuilder()
                                                                        .responseCode("200").description("The type record was successfully retrieved")
                                                                        .implementation(Type.class))
                                                        .response(
                                                                responseBuilder()
                                                                        .responseCode("500").description("An unexpected condition was encountered while retrieving the type record")
                                                                        .implementation(String.class)))
                                        .build())

                                .and(route()
                                        .GET("/api/v1/types/{database}/all",
                                                accept(APPLICATION_JSON),
                                                handler::retrieveTypes,
                                                ops -> ops
                                                        .tag("Retrieve")
                                                        .operationId("retrieveTypes")
                                                        .beanClass(TypesHandler.class)
                                                        .beanMethod("retrieveTypes")
                                                        .description("Retrieves all or some of the type records from the database depending on whether query parameters were included in the query string")
                                                        .parameter(
                                                                parameterBuilder()
                                                                        .name("database").in(ParameterIn.PATH)
                                                                        .description("The name of the database from which the type records should be retrieved")
                                                                        .implementation(String.class))
                                                        .parameter(
                                                                parameterBuilder()
                                                                        .name("ids").in(ParameterIn.QUERY)
                                                                        .description("The unique identifiers of the type records that should be retrieved")
                                                                        .implementation(Long.class))
                                                        .parameter(
                                                                parameterBuilder()
                                                                        .name("limit").in(ParameterIn.QUERY)
                                                                        .description("The maximum number of Data Type Records to return")
                                                                        .implementation(Integer.class))
                                                        .parameter(
                                                                parameterBuilder()
                                                                        .name("offset").in(ParameterIn.QUERY)
                                                                        .description("The starting point from which Data Type Records should be returned")
                                                                        .implementation(Integer.class))
                                                        .response(
                                                                responseBuilder()
                                                                        .responseCode("200").description("The type records were successfully retrieved")
                                                                        .implementationArray(Type.class))
                                                        .response(
                                                                responseBuilder()
                                                                        .responseCode("500").description("An unexpected condition was encountered while retrieving the type records")
                                                                        .implementation(String.class)))
                                        .build())
                                .and(route()
                                        .GET("/api/v1/types/{database}/total",
                                                accept(APPLICATION_JSON),
                                                handler::retrieveTotalTypes,
                                                ops -> ops
                                                        .tag("Retrieve")
                                                        .operationId("retrieveTotalTypes")
                                                        .beanClass(TypesHandler.class)
                                                        .beanMethod("retrieveTotalTypes")
                                                        .description("Retrieves the estimated or actual count of type records from the database given a specific query and its parameters")
                                                        .parameter(
                                                                parameterBuilder()
                                                                        .name("database").in(ParameterIn.PATH)
                                                                        .description("The name of the database from which the type records count should be made")
                                                                        .implementation(String.class))
                                                        .parameter(
                                                                parameterBuilder()
                                                                        .name("ids").in(ParameterIn.QUERY)
                                                                        .description("The unique identifiers of the type records that should be included in the count")
                                                                        .implementation(Long.class))
                                                        .response(
                                                                responseBuilder()
                                                                        .responseCode("200").description("The type records were successfully retrieved")
                                                                        .implementationArray(Type.class))
                                                        .response(
                                                                responseBuilder()
                                                                        .responseCode("500").description("An unexpected condition was encountered while retrieving the type records")
                                                                        .implementation(String.class)))
                                        .build())

                                .and(route()
                                        .PUT("/api/v1/types/{database}",
                                                accept(APPLICATION_JSON).and(contentType(APPLICATION_JSON)),
                                                handler::updateType,
                                                ops -> ops
                                                        .tag("Update")
                                                        .operationId("updateType")
                                                        .beanClass(TypesHandler.class)
                                                        .beanMethod("updateType")
                                                        .description("Updates a single type record in the database")
                                                        .parameter(
                                                                parameterBuilder()
                                                                        .name("database").in(ParameterIn.PATH)
                                                                        .description("The name of the database within which the type record should be updated")
                                                                        .implementation(String.class))
                                                        .response(
                                                                responseBuilder()
                                                                        .responseCode("200").description("The type record was successfully updated")
                                                                        .implementation(Type.class))
                                                        .response(
                                                                responseBuilder()
                                                                        .responseCode("500").description("An unexpected condition was encountered while updating the type record")
                                                                        .implementation(String.class)))
                                        .build())

                                .and(route()
                                        .PUT("/api/v1/types/{database}/all",
                                                accept(APPLICATION_JSON).and(contentType(APPLICATION_JSON)),
                                                handler::updateTypes,
                                                ops -> ops
                                                        .tag("Update")
                                                        .operationId("updateType")
                                                        .beanClass(TypesHandler.class)
                                                        .beanMethod("updateTypes")
                                                        .description("Updates several type records in the database")
                                                        .parameter(
                                                                parameterBuilder()
                                                                        .name("database").in(ParameterIn.PATH)
                                                                        .description("The name of the database within which the type records should be updated")
                                                                        .implementation(String.class))
                                                        .requestBody(
                                                                requestBodyBuilder()
                                                                        .content(contentBuilder()
                                                                                .array(arraySchemaBuilder()
                                                                                        .schema(schemaBuilder()
                                                                                                .implementation(Type.class)))))
                                                        .response(
                                                                responseBuilder()
                                                                        .responseCode("200").description("The type records were successfully updated")
                                                                        .implementation(Type.class))
                                                        .response(
                                                                responseBuilder()
                                                                        .responseCode("500").description("An unexpected condition was encountered while updating the type records")
                                                                        .implementation(String.class)))
                                        .build())

                                .and(route()
                                        .DELETE("/api/v1/types/{database}/ids/{id}",
                                                accept(APPLICATION_JSON),
                                                handler::deleteType,
                                                ops -> ops
                                                        .tag("Delete")
                                                        .operationId("deleteType")
                                                        .beanClass(TypesHandler.class)
                                                        .beanMethod("deleteType")
                                                        .description("Deletes a single type record from the database given its unique identifier")
                                                        .parameter(
                                                                parameterBuilder()
                                                                        .name("database").in(ParameterIn.PATH)
                                                                        .description("The name of the database from which the type record should be deleted")
                                                                        .implementation(String.class))
                                                        .parameter(
                                                                parameterBuilder()
                                                                        .name("id").in(ParameterIn.PATH)
                                                                        .description("The unique identifier of the desired type record")
                                                                        .implementation(Long.class))
                                                        .response(
                                                                responseBuilder()
                                                                        .responseCode("200").description("The type record was successfully deleted")
                                                                        .implementation(Integer.class)
                                                                        .description("The number of type records successfully deleted"))
                                                        .response(
                                                                responseBuilder()
                                                                        .responseCode("500").description("An unexpected condition was encountered while deleting the type record")
                                                                        .implementation(String.class)))
                                        .build())

                                .and(route()
                                        .DELETE("/api/v1/types/{database}/all",
                                                accept(APPLICATION_JSON),
                                                handler::deleteTypes,
                                                ops -> ops
                                                        .tag("Delete")
                                                        .operationId("deleteTypes")
                                                        .beanClass(TypesHandler.class)
                                                        .beanMethod("deleteTypes")
                                                        .description("Deletes all or some of the type records from the database depending on whether or not query parameters were included in the query string")
                                                        .parameter(
                                                                parameterBuilder()
                                                                        .name("database").in(ParameterIn.PATH)
                                                                        .description("The name of the database from which the type records should be deleted")
                                                                        .implementation(String.class))
                                                        .parameter(
                                                                parameterBuilder()
                                                                        .name("ids").in(ParameterIn.QUERY)
                                                                        .description("The unique identifiers of the type records that should be included in the deletion")
                                                                        .implementation(Long.class))
                                                        .response(
                                                                responseBuilder()
                                                                        .responseCode("200").description("The type records were successfully deleted")
                                                                        .implementation(Integer.class)
                                                                        .description("The number of type records successfully deleted"))
                                                        .response(
                                                                responseBuilder()
                                                                        .responseCode("500").description("An unexpected condition was encountered while deleting the type records")
                                                                        .implementation(String.class)))
                                        .build()));
    }

}
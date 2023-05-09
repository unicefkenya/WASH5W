/*
 * Copyright (C) 2021 Second Mile
 *
 * This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0.
 * If a copy of the MPL was not distributed with this file,
 * You can obtain one at http://mozilla.org/MPL/2.0/.
 */
package ke.co.miles.attributes.configurations;

import io.swagger.v3.oas.annotations.enums.ParameterIn;
import ke.co.miles.attributes.handlers.AttributesHandler;
import ke.co.miles.attributes.models.Attribute;
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
    RouterFunction<ServerResponse> routeRequests(AttributesHandler handler) {

        return
                route()
                        .POST("/api/v1/attributes/{database}",
                                accept(APPLICATION_JSON).and(contentType(APPLICATION_JSON)),
                                handler::createAttribute,
                                ops -> ops
                                        .tag("Create")
                                        .operationId("createAttribute")
                                        .beanClass(AttributesHandler.class)
                                        .beanMethod("createAttribute")
                                        .description("Inserts a single attribute record into the database")
                                        .parameter(
                                                parameterBuilder()
                                                        .name("database").in(ParameterIn.PATH)
                                                        .description("The name of the database within which the attribute record should be inserted")
                                                        .implementation(String.class))
                                        .requestBody(
                                                requestBodyBuilder()
                                                        .content(contentBuilder()
                                                                .schema(schemaBuilder()
                                                                        .implementation(Attribute.class))))
                                        .response(
                                                responseBuilder()
                                                        .responseCode("201").description("The attribute record was successfully created")
                                                        .implementation(Attribute.class))
                                        .response(
                                                responseBuilder()
                                                        .responseCode("500").description("An unexpected condition was encountered while creating the attribute record")
                                                        .implementation(String.class)))
                        .build()

                        .and(route()
                                .POST("/api/v1/attributes/{database}/all",
                                        accept(APPLICATION_JSON).and(contentType(APPLICATION_JSON)),
                                        handler::createAttributes,
                                        ops -> ops
                                                .tag("Create")
                                                .operationId("createAttributes")
                                                .beanClass(AttributesHandler.class)
                                                .beanMethod("createAttributes")
                                                .description("Inserts several attribute records into the database")
                                                .parameter(
                                                        parameterBuilder()
                                                                .name("database").in(ParameterIn.PATH)
                                                                .description("The name of the database within which the attribute records should be inserted")
                                                                .implementation(String.class))
                                                .requestBody(
                                                        requestBodyBuilder()
                                                                .content(contentBuilder()
                                                                        .array(arraySchemaBuilder()
                                                                                .schema(schemaBuilder()
                                                                                        .implementation(Attribute.class)))))

                                                .response(
                                                        responseBuilder()
                                                                .responseCode("201").description("The attribute records were successfully created")
                                                                .implementationArray(Attribute.class))

                                                .response(
                                                        responseBuilder()
                                                                .responseCode("500").description("An unexpected condition was encountered while creating the attribute records")
                                                                .implementation(String.class)))
                                .build()

                                .and(route()
                                        .GET("/api/v1/attributes/{database}/ids/{id}",
                                                accept(APPLICATION_JSON),
                                                handler::retrieveAttribute,
                                                ops -> ops
                                                        .tag("Retrieve")
                                                        .operationId("retrieveAttribute")
                                                        .beanClass(AttributesHandler.class)
                                                        .beanMethod("retrieveAttribute")
                                                        .description("Retrieves a single attribute record from the database given its unique identifier")
                                                        .parameter(
                                                                parameterBuilder()
                                                                        .name("database").in(ParameterIn.PATH)
                                                                        .description("The name of the database from which the attribute record should be retrieved")
                                                                        .implementation(String.class))
                                                        .parameter(
                                                                parameterBuilder()
                                                                        .name("id").in(ParameterIn.PATH)
                                                                        .description("The unique identifier of the attribute record that should be retrieved")
                                                                        .implementation(Long.class))
                                                        .response(
                                                                responseBuilder()
                                                                        .responseCode("200").description("The attribute record was successfully retrieved")
                                                                        .implementation(Attribute.class))
                                                        .response(
                                                                responseBuilder()
                                                                        .responseCode("500").description("An unexpected condition was encountered while retrieving the attribute record")
                                                                        .implementation(String.class)))
                                        .build())

                                .and(route()
                                        .GET("/api/v1/attributes/{database}/all",
                                                accept(APPLICATION_JSON),
                                                handler::retrieveAttributes,
                                                ops -> ops
                                                        .tag("Retrieve")
                                                        .operationId("retrieveAttributes")
                                                        .beanClass(AttributesHandler.class)
                                                        .beanMethod("retrieveAttributes")
                                                        .description("Retrieves all or some of the attribute records from the database depending on whether query parameters were included in the query string")
                                                        .parameter(
                                                                parameterBuilder()
                                                                        .name("database").in(ParameterIn.PATH)
                                                                        .description("The name of the database from which the attribute records should be retrieved")
                                                                        .implementation(String.class))
                                                        .parameter(
                                                                parameterBuilder()
                                                                        .name("ids").in(ParameterIn.QUERY)
                                                                        .description("The unique identifiers of the attribute records that should be retrieved")
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
                                                                        .responseCode("200").description("The attribute records were successfully retrieved")
                                                                        .implementationArray(Attribute.class))
                                                        .response(
                                                                responseBuilder()
                                                                        .responseCode("500").description("An unexpected condition was encountered while retrieving the attribute records")
                                                                        .implementation(String.class)))
                                        .build())
                                .and(route()
                                        .GET("/api/v1/attributes/{database}/total",
                                                accept(APPLICATION_JSON),
                                                handler::retrieveTotalAttributes,
                                                ops -> ops
                                                        .tag("Retrieve")
                                                        .operationId("retrieveTotalAttributes")
                                                        .beanClass(AttributesHandler.class)
                                                        .beanMethod("retrieveTotalAttributes")
                                                        .description("Retrieves the estimated or actual count of attribute records from the database given a specific query and its parameters")
                                                        .parameter(
                                                                parameterBuilder()
                                                                        .name("database").in(ParameterIn.PATH)
                                                                        .description("The name of the database from which the attribute records count should be made")
                                                                        .implementation(String.class))
                                                        .parameter(
                                                                parameterBuilder()
                                                                        .name("ids").in(ParameterIn.QUERY)
                                                                        .description("The unique identifiers of the attribute records that should be included in the count")
                                                                        .implementation(Long.class))
                                                        .response(
                                                                responseBuilder()
                                                                        .responseCode("200").description("The attribute records were successfully retrieved")
                                                                        .implementationArray(Attribute.class))
                                                        .response(
                                                                responseBuilder()
                                                                        .responseCode("500").description("An unexpected condition was encountered while retrieving the attribute records")
                                                                        .implementation(String.class)))
                                        .build())

                                .and(route()
                                        .PUT("/api/v1/attributes/{database}",
                                                accept(APPLICATION_JSON).and(contentType(APPLICATION_JSON)),
                                                handler::updateAttribute,
                                                ops -> ops
                                                        .tag("Update")
                                                        .operationId("updateAttribute")
                                                        .beanClass(AttributesHandler.class)
                                                        .beanMethod("updateAttribute")
                                                        .description("Updates a single attribute record in the database")
                                                        .parameter(
                                                                parameterBuilder()
                                                                        .name("database").in(ParameterIn.PATH)
                                                                        .description("The name of the database within which the attribute record should be updated")
                                                                        .implementation(String.class))
                                                        .response(
                                                                responseBuilder()
                                                                        .responseCode("200").description("The attribute record was successfully updated")
                                                                        .implementation(Attribute.class))
                                                        .response(
                                                                responseBuilder()
                                                                        .responseCode("500").description("An unexpected condition was encountered while updating the attribute record")
                                                                        .implementation(String.class)))
                                        .build())

                                .and(route()
                                        .PUT("/api/v1/attributes/{database}/all",
                                                accept(APPLICATION_JSON).and(contentType(APPLICATION_JSON)),
                                                handler::updateAttributes,
                                                ops -> ops
                                                        .tag("Update")
                                                        .operationId("updateAttribute")
                                                        .beanClass(AttributesHandler.class)
                                                        .beanMethod("updateAttributes")
                                                        .description("Updates several attribute records in the database")
                                                        .parameter(
                                                                parameterBuilder()
                                                                        .name("database").in(ParameterIn.PATH)
                                                                        .description("The name of the database within which the attribute records should be updated")
                                                                        .implementation(String.class))
                                                        .requestBody(
                                                                requestBodyBuilder()
                                                                        .content(contentBuilder()
                                                                                .array(arraySchemaBuilder()
                                                                                        .schema(schemaBuilder()
                                                                                                .implementation(Attribute.class)))))
                                                        .response(
                                                                responseBuilder()
                                                                        .responseCode("200").description("The attribute records were successfully updated")
                                                                        .implementation(Attribute.class))
                                                        .response(
                                                                responseBuilder()
                                                                        .responseCode("500").description("An unexpected condition was encountered while updating the attribute records")
                                                                        .implementation(String.class)))
                                        .build())

                                .and(route()
                                        .DELETE("/api/v1/attributes/{database}/ids/{id}",
                                                accept(APPLICATION_JSON),
                                                handler::deleteAttribute,
                                                ops -> ops
                                                        .tag("Delete")
                                                        .operationId("deleteAttribute")
                                                        .beanClass(AttributesHandler.class)
                                                        .beanMethod("deleteAttribute")
                                                        .description("Deletes a single attribute record from the database given its unique identifier")
                                                        .parameter(
                                                                parameterBuilder()
                                                                        .name("database").in(ParameterIn.PATH)
                                                                        .description("The name of the database from which the attribute record should be deleted")
                                                                        .implementation(String.class))
                                                        .parameter(
                                                                parameterBuilder()
                                                                        .name("id").in(ParameterIn.PATH)
                                                                        .description("The unique identifier of the desired attribute record")
                                                                        .implementation(Long.class))
                                                        .response(
                                                                responseBuilder()
                                                                        .responseCode("200").description("The attribute record was successfully deleted")
                                                                        .implementation(Integer.class)
                                                                        .description("The number of attribute records successfully deleted"))
                                                        .response(
                                                                responseBuilder()
                                                                        .responseCode("500").description("An unexpected condition was encountered while deleting the attribute record")
                                                                        .implementation(String.class)))
                                        .build())

                                .and(route()
                                        .DELETE("/api/v1/attributes/{database}/all",
                                                accept(APPLICATION_JSON),
                                                handler::deleteAttributes,
                                                ops -> ops
                                                        .tag("Delete")
                                                        .operationId("deleteAttributes")
                                                        .beanClass(AttributesHandler.class)
                                                        .beanMethod("deleteAttributes")
                                                        .description("Deletes all or some of the attribute records from the database depending on whether or not query parameters were included in the query string")
                                                        .parameter(
                                                                parameterBuilder()
                                                                        .name("database").in(ParameterIn.PATH)
                                                                        .description("The name of the database from which the attribute records should be deleted")
                                                                        .implementation(String.class))
                                                        .parameter(
                                                                parameterBuilder()
                                                                        .name("ids").in(ParameterIn.QUERY)
                                                                        .description("The unique identifiers of the attribute records that should be included in the deletion")
                                                                        .implementation(Long.class))
                                                        .response(
                                                                responseBuilder()
                                                                        .responseCode("200").description("The attribute records were successfully deleted")
                                                                        .implementation(Integer.class)
                                                                        .description("The number of attribute records successfully deleted"))
                                                        .response(
                                                                responseBuilder()
                                                                        .responseCode("500").description("An unexpected condition was encountered while deleting the attribute records")
                                                                        .implementation(String.class)))
                                        .build()));
    }

}
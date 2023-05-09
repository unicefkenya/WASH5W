/*
 * Copyright (C) 2021 Second Mile
 *
 * This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0.
 * If a copy of the MPL was not distributed with this file,
 * You can obtain one at http://mozilla.org/MPL/2.0/.
 */
package ke.co.miles.levels.configurations;

import io.swagger.v3.oas.annotations.enums.ParameterIn;
import ke.co.miles.levels.handlers.LevelsHandler;
import ke.co.miles.levels.models.Level;
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
    RouterFunction<ServerResponse> routeRequests(LevelsHandler handler) {

        return
                route()
                        .POST("/api/v1/levels/{database}",
                                accept(APPLICATION_JSON).and(contentType(APPLICATION_JSON)),
                                handler::createLevel,
                                ops -> ops
                                        .tag("Create")
                                        .operationId("createLevel")
                                        .beanClass(LevelsHandler.class)
                                        .beanMethod("createLevel")
                                        .description("Inserts a single level record into the database")
                                        .parameter(
                                                parameterBuilder()
                                                        .name("database").in(ParameterIn.PATH)
                                                        .description("The name of the database within which the level record should be inserted")
                                                        .implementation(String.class))
                                        .requestBody(
                                                requestBodyBuilder()
                                                        .content(contentBuilder()
                                                                .schema(schemaBuilder()
                                                                        .implementation(Level.class))))
                                        .response(
                                                responseBuilder()
                                                        .responseCode("201").description("The level record was successfully created")
                                                        .implementation(Level.class))
                                        .response(
                                                responseBuilder()
                                                        .responseCode("500").description("An unexpected condition was encountered while creating the level record")
                                                        .implementation(String.class)))
                        .build()

                        .and(route()
                                .POST("/api/v1/levels/{database}/all",
                                        accept(APPLICATION_JSON).and(contentType(APPLICATION_JSON)),
                                        handler::createLevels,
                                        ops -> ops
                                                .tag("Create")
                                                .operationId("createLevels")
                                                .beanClass(LevelsHandler.class)
                                                .beanMethod("createLevels")
                                                .description("Inserts several level records into the database")
                                                .parameter(
                                                        parameterBuilder()
                                                                .name("database").in(ParameterIn.PATH)
                                                                .description("The name of the database within which the level records should be inserted")
                                                                .implementation(String.class))
                                                .requestBody(
                                                        requestBodyBuilder()
                                                                .content(contentBuilder()
                                                                        .array(arraySchemaBuilder()
                                                                                .schema(schemaBuilder()
                                                                                        .implementation(Level.class)))))

                                                .response(
                                                        responseBuilder()
                                                                .responseCode("201").description("The level records were successfully created")
                                                                .implementationArray(Level.class))

                                                .response(
                                                        responseBuilder()
                                                                .responseCode("500").description("An unexpected condition was encountered while creating the level records")
                                                                .implementation(String.class)))
                                .build()

                                .and(route()
                                        .GET("/api/v1/levels/{database}/ids/{id}",
                                                accept(APPLICATION_JSON),
                                                handler::retrieveLevel,
                                                ops -> ops
                                                        .tag("Retrieve")
                                                        .operationId("retrieveLevel")
                                                        .beanClass(LevelsHandler.class)
                                                        .beanMethod("retrieveLevel")
                                                        .description("Retrieves a single level record from the database given its unique identifier")
                                                        .parameter(
                                                                parameterBuilder()
                                                                        .name("database").in(ParameterIn.PATH)
                                                                        .description("The name of the database from which the level record should be retrieved")
                                                                        .implementation(String.class))
                                                        .parameter(
                                                                parameterBuilder()
                                                                        .name("id").in(ParameterIn.PATH)
                                                                        .description("The unique identifier of the level record that should be retrieved")
                                                                        .implementation(Long.class))
                                                        .response(
                                                                responseBuilder()
                                                                        .responseCode("200").description("The level record was successfully retrieved")
                                                                        .implementation(Level.class))
                                                        .response(
                                                                responseBuilder()
                                                                        .responseCode("500").description("An unexpected condition was encountered while retrieving the level record")
                                                                        .implementation(String.class)))
                                        .build())

                                .and(route()
                                        .GET("/api/v1/levels/{database}/all",
                                                accept(APPLICATION_JSON),
                                                handler::retrieveLevels,
                                                ops -> ops
                                                        .tag("Retrieve")
                                                        .operationId("retrieveLevels")
                                                        .beanClass(LevelsHandler.class)
                                                        .beanMethod("retrieveLevels")
                                                        .description("Retrieves all or some of the level records from the database depending on whether query parameters were included in the query string")
                                                        .parameter(
                                                                parameterBuilder()
                                                                        .name("database").in(ParameterIn.PATH)
                                                                        .description("The name of the database from which the level records should be retrieved")
                                                                        .implementation(String.class))
                                                        .parameter(
                                                                parameterBuilder()
                                                                        .name("ids").in(ParameterIn.QUERY)
                                                                        .description("The unique identifiers of the level records that should be retrieved")
                                                                        .implementation(Long.class))
                                                        .parameter(
                                                                parameterBuilder()
                                                                        .name("limit").in(ParameterIn.QUERY)
                                                                        .description("The maximum number of Data Level Records to return")
                                                                        .implementation(Integer.class))
                                                        .parameter(
                                                                parameterBuilder()
                                                                        .name("offset").in(ParameterIn.QUERY)
                                                                        .description("The starting point from which Data Level Records should be returned")
                                                                        .implementation(Integer.class))
                                                        .response(
                                                                responseBuilder()
                                                                        .responseCode("200").description("The level records were successfully retrieved")
                                                                        .implementationArray(Level.class))
                                                        .response(
                                                                responseBuilder()
                                                                        .responseCode("500").description("An unexpected condition was encountered while retrieving the level records")
                                                                        .implementation(String.class)))
                                        .build())
                                .and(route()
                                        .GET("/api/v1/levels/{database}/total",
                                                accept(APPLICATION_JSON),
                                                handler::retrieveTotalLevels,
                                                ops -> ops
                                                        .tag("Retrieve")
                                                        .operationId("retrieveTotalLevels")
                                                        .beanClass(LevelsHandler.class)
                                                        .beanMethod("retrieveTotalLevels")
                                                        .description("Retrieves the estimated or actual count of level records from the database given a specific query and its parameters")
                                                        .parameter(
                                                                parameterBuilder()
                                                                        .name("database").in(ParameterIn.PATH)
                                                                        .description("The name of the database from which the level records count should be made")
                                                                        .implementation(String.class))
                                                        .parameter(
                                                                parameterBuilder()
                                                                        .name("ids").in(ParameterIn.QUERY)
                                                                        .description("The unique identifiers of the level records that should be included in the count")
                                                                        .implementation(Long.class))
                                                        .response(
                                                                responseBuilder()
                                                                        .responseCode("200").description("The level records were successfully retrieved")
                                                                        .implementationArray(Level.class))
                                                        .response(
                                                                responseBuilder()
                                                                        .responseCode("500").description("An unexpected condition was encountered while retrieving the level records")
                                                                        .implementation(String.class)))
                                        .build())

                                .and(route()
                                        .PUT("/api/v1/levels/{database}",
                                                accept(APPLICATION_JSON).and(contentType(APPLICATION_JSON)),
                                                handler::updateLevel,
                                                ops -> ops
                                                        .tag("Update")
                                                        .operationId("updateLevel")
                                                        .beanClass(LevelsHandler.class)
                                                        .beanMethod("updateLevel")
                                                        .description("Updates a single level record in the database")
                                                        .parameter(
                                                                parameterBuilder()
                                                                        .name("database").in(ParameterIn.PATH)
                                                                        .description("The name of the database within which the level record should be updated")
                                                                        .implementation(String.class))
                                                        .response(
                                                                responseBuilder()
                                                                        .responseCode("200").description("The level record was successfully updated")
                                                                        .implementation(Level.class))
                                                        .response(
                                                                responseBuilder()
                                                                        .responseCode("500").description("An unexpected condition was encountered while updating the level record")
                                                                        .implementation(String.class)))
                                        .build())

                                .and(route()
                                        .PUT("/api/v1/levels/{database}/all",
                                                accept(APPLICATION_JSON).and(contentType(APPLICATION_JSON)),
                                                handler::updateLevels,
                                                ops -> ops
                                                        .tag("Update")
                                                        .operationId("updateLevel")
                                                        .beanClass(LevelsHandler.class)
                                                        .beanMethod("updateLevels")
                                                        .description("Updates several level records in the database")
                                                        .parameter(
                                                                parameterBuilder()
                                                                        .name("database").in(ParameterIn.PATH)
                                                                        .description("The name of the database within which the level records should be updated")
                                                                        .implementation(String.class))
                                                        .requestBody(
                                                                requestBodyBuilder()
                                                                        .content(contentBuilder()
                                                                                .array(arraySchemaBuilder()
                                                                                        .schema(schemaBuilder()
                                                                                                .implementation(Level.class)))))
                                                        .response(
                                                                responseBuilder()
                                                                        .responseCode("200").description("The level records were successfully updated")
                                                                        .implementation(Level.class))
                                                        .response(
                                                                responseBuilder()
                                                                        .responseCode("500").description("An unexpected condition was encountered while updating the level records")
                                                                        .implementation(String.class)))
                                        .build())

                                .and(route()
                                        .DELETE("/api/v1/levels/{database}/ids/{id}",
                                                accept(APPLICATION_JSON),
                                                handler::deleteLevel,
                                                ops -> ops
                                                        .tag("Delete")
                                                        .operationId("deleteLevel")
                                                        .beanClass(LevelsHandler.class)
                                                        .beanMethod("deleteLevel")
                                                        .description("Deletes a single level record from the database given its unique identifier")
                                                        .parameter(
                                                                parameterBuilder()
                                                                        .name("database").in(ParameterIn.PATH)
                                                                        .description("The name of the database from which the level record should be deleted")
                                                                        .implementation(String.class))
                                                        .parameter(
                                                                parameterBuilder()
                                                                        .name("id").in(ParameterIn.PATH)
                                                                        .description("The unique identifier of the desired level record")
                                                                        .implementation(Long.class))
                                                        .response(
                                                                responseBuilder()
                                                                        .responseCode("200").description("The level record was successfully deleted")
                                                                        .implementation(Integer.class)
                                                                        .description("The number of level records successfully deleted"))
                                                        .response(
                                                                responseBuilder()
                                                                        .responseCode("500").description("An unexpected condition was encountered while deleting the level record")
                                                                        .implementation(String.class)))
                                        .build())

                                .and(route()
                                        .DELETE("/api/v1/levels/{database}/all",
                                                accept(APPLICATION_JSON),
                                                handler::deleteLevels,
                                                ops -> ops
                                                        .tag("Delete")
                                                        .operationId("deleteLevels")
                                                        .beanClass(LevelsHandler.class)
                                                        .beanMethod("deleteLevels")
                                                        .description("Deletes all or some of the level records from the database depending on whether or not query parameters were included in the query string")
                                                        .parameter(
                                                                parameterBuilder()
                                                                        .name("database").in(ParameterIn.PATH)
                                                                        .description("The name of the database from which the level records should be deleted")
                                                                        .implementation(String.class))
                                                        .parameter(
                                                                parameterBuilder()
                                                                        .name("ids").in(ParameterIn.QUERY)
                                                                        .description("The unique identifiers of the level records that should be included in the deletion")
                                                                        .implementation(Long.class))
                                                        .response(
                                                                responseBuilder()
                                                                        .responseCode("200").description("The level records were successfully deleted")
                                                                        .implementation(Integer.class)
                                                                        .description("The number of level records successfully deleted"))
                                                        .response(
                                                                responseBuilder()
                                                                        .responseCode("500").description("An unexpected condition was encountered while deleting the level records")
                                                                        .implementation(String.class)))
                                        .build()));
    }

}
/*
 * Copyright (C) 2021 Second Mile
 *
 * This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0.
 * If a copy of the MPL was not distributed with this file,
 * You can obtain one at http://mozilla.org/MPL/2.0/.
 */
package ke.co.miles.types;

import ke.co.miles.types.models.Type;
import ke.co.miles.types.util.builders.TypeBuilder;
import org.assertj.core.api.Assertions;
import org.jetbrains.annotations.NotNull;
import org.json.JSONException;
import org.junit.AfterClass;
import org.junit.jupiter.api.Test;
import org.skyscreamer.jsonassert.JSONAssert;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.reactive.AutoConfigureWebTestClient;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.context.SpringBootTest.WebEnvironment;
import org.springframework.boot.test.util.TestPropertyValues;
import org.springframework.context.ApplicationContextInitializer;
import org.springframework.context.ConfigurableApplicationContext;
import org.springframework.test.context.ContextConfiguration;
import org.springframework.test.web.reactive.server.WebTestClient;
import org.testcontainers.containers.PostgreSQLContainer;
import org.testcontainers.junit.jupiter.Testcontainers;

import java.util.Collections;

/**
 * @author Kwaje Anthony <tony@miles.co.ke>
 * @version 1.0
 * @since 1.0
 */
@Testcontainers
@SpringBootTest(webEnvironment = WebEnvironment.RANDOM_PORT)
@AutoConfigureWebTestClient
@ContextConfiguration(initializers = RetrieveTypesIT.Initializer.class)
public class RetrieveTypesIT {

    @Autowired
    WebTestClient webTestClient;

    static final PostgreSQLContainer postgreSQLContainer;
    static final Type type1;
    static final Type type2;
    static final Type type3;

    static {

        postgreSQLContainer =
                new PostgreSQLContainer("postgres:10.15")
                        .withDatabaseName("test")
                        .withUsername("postgres")
                        .withPassword("postgres");

        postgreSQLContainer
                .withInitScript("init.sql")
                .start();

        type1 =
                new TypeBuilder()
                        .id(1L)
                        .data("{\"index\": 1, \"name\": \"First Type\", \"valid\": true}")
                        .version(1)
                        .build();

        type2 =
                new TypeBuilder()
                        .id(2L)
                        .data("{\"index\": 2, \"name\": \"Second Type\", \"valid\": true}")
                        .version(1)
                        .build();

        type3 =
                new TypeBuilder()
                        .id(3L)
                        .data("{\"index\": 3, \"name\": \"Third Type\", \"valid\": false}")
                        .version(1)
                        .build();
    }

    public static class Initializer implements ApplicationContextInitializer<ConfigurableApplicationContext> {

        @Override
        public void initialize(@NotNull ConfigurableApplicationContext configurableApplicationContext) {
            TestPropertyValues values = TestPropertyValues.of(
                    "database.host=" + postgreSQLContainer.getHost(),
                    "database.port=" + postgreSQLContainer.getFirstMappedPort(),
                    "database.username=" + postgreSQLContainer.getUsername(),
                    "database.password=" + postgreSQLContainer.getPassword()
            );
            values.applyTo(configurableApplicationContext);
        }
    }

    @AfterClass
    public static void shutdown() {

        postgreSQLContainer.stop();
    }

    @Test
    public void Given_TypeRecordsExist_When_GetAllWithIdsFilter_Then_OnlyTypeRecordsWithTheSpecifiedIdsWillBeReturned() {

        webTestClient
                .get()
                .uri(uriBuilder ->
                        uriBuilder
                                .path("/api/v1/types/test/all")
                                .queryParam("ids", "{id1}", "{id2}")
                                .build(type1.getId().toString(), type3.getId().toString()))
                .exchange()
                .expectStatus().isOk()
                .expectBodyList(Type.class)
                .value(response -> {

                            Collections.sort(response);

                            Assertions.assertThat(response.get(0).getId()).isEqualTo(type1.getId());
                            try {
                                JSONAssert.assertEquals(type1.getData(), response.get(0).getData(), false);
                            } catch (JSONException e) {
                                throw new RuntimeException(e);
                            }
                            Assertions.assertThat(response.get(0).getVersion()).isEqualTo(type1.getVersion());


                            Assertions.assertThat(response.get(1).getId()).isEqualTo(type3.getId());
                            try {
                                JSONAssert.assertEquals(type3.getData(), response.get(1).getData(), false);
                            } catch (JSONException e) {
                                throw new RuntimeException(e);
                            }
                            Assertions.assertThat(response.get(1).getVersion()).isEqualTo(type3.getVersion());

                        }
                );
    }

    @Test
    public void Given_TypeRecordsExist_When_GetAllWithOtherNumericValuedFilter_Then_OnlyTypeRecordsWithTheSpecifiedNumberWillBeReturned() {

        webTestClient
                .get()
                .uri(uriBuilder ->
                        uriBuilder
                                .path("/api/v1/types/test/all")
                                .queryParam("index", "{param1}")
                                .build("3"))
                .exchange()
                .expectStatus().isOk()
                .expectBodyList(Type.class)
                .value(response -> {

                            Collections.sort(response);

                            Assertions.assertThat(response.get(0).getId()).isEqualTo(type3.getId());
                            try {
                                JSONAssert.assertEquals(type3.getData(), response.get(0).getData(), false);
                            } catch (JSONException e) {
                                throw new RuntimeException(e);
                            }
                            Assertions.assertThat(response.get(0).getVersion()).isEqualTo(1);


                        }
                );
    }

    @Test
    public void Given_TypeRecordsExist_When_GetAllWithOtherStringValuedFilter_Then_OnlyTypeRecordsWithTheSpecifiedStringValueWillBeReturned() {

        webTestClient
                .get()
                .uri(uriBuilder ->
                        uriBuilder
                                .path("/api/v1/types/test/all")
                                .queryParam("name", "{param1}")
                                .build("Thi"))
                .exchange()
                .expectStatus().isOk()
                .expectBodyList(Type.class)
                .value(response -> {

                            Collections.sort(response);

                            Assertions.assertThat(response.get(0).getId()).isEqualTo(type3.getId());
                            try {
                                JSONAssert.assertEquals(type3.getData(), response.get(0).getData(), false);
                            } catch (JSONException e) {
                                throw new RuntimeException(e);
                            }
                            Assertions.assertThat(response.get(0).getVersion()).isEqualTo(1);


                        }
                );
    }


    @Test
    public void Given_TypeRecordsExist_When_GetAllWithOtherBooleanValuedFilter_Then_OnlyTypeRecordsWithTheSpecifiedBooleanWillBeReturned() {

        webTestClient
                .get()
                .uri(uriBuilder ->
                        uriBuilder
                                .path("/api/v1/types/test/all")
                                .queryParam("valid", "{param1}")
                                .build("false"))
                .exchange()
                .expectStatus().isOk()
                .expectBodyList(Type.class)
                .value(response -> {

                            Collections.sort(response);

                            Assertions.assertThat(response.get(0).getId()).isEqualTo(type3.getId());
                            try {
                                JSONAssert.assertEquals(type3.getData(), response.get(0).getData(), false);
                            } catch (JSONException e) {
                                throw new RuntimeException(e);
                            }
                            Assertions.assertThat(response.get(0).getVersion()).isEqualTo(1);


                        }
                );
    }


    @Test
    public void Given_TypeRecordsExist_When_GetAllWithoutFilters_Then_AllTypeRecordsWillBeReturned() {

        webTestClient
                .get()
                .uri(uriBuilder ->
                        uriBuilder
                                .path("/api/v1/types/test/all")
                                .build())
                .exchange()
                .expectStatus().isOk()
                .expectBodyList(Type.class)
                .value(response -> {

                            Collections.sort(response);

                            Assertions.assertThat(response.get(0).getId()).isEqualTo(type1.getId());
                            try {
                                JSONAssert.assertEquals(type1.getData(), response.get(0).getData(), false);
                            } catch (JSONException e) {
                                throw new RuntimeException(e);
                            }
                            Assertions.assertThat(response.get(0).getVersion()).isEqualTo(type1.getVersion());


                            Assertions.assertThat(response.get(1).getId()).isEqualTo(type2.getId());
                            try {
                                JSONAssert.assertEquals(type2.getData(), response.get(1).getData(), false);
                            } catch (JSONException e) {
                                throw new RuntimeException(e);
                            }
                            Assertions.assertThat(response.get(1).getVersion()).isEqualTo(type2.getVersion());


                            Assertions.assertThat(response.get(2).getId()).isEqualTo(type3.getId());
                            try {
                                JSONAssert.assertEquals(type3.getData(), response.get(2).getData(), false);
                            } catch (JSONException e) {
                                throw new RuntimeException(e);
                            }
                            Assertions.assertThat(response.get(2).getVersion()).isEqualTo(type3.getVersion());


                        }
                );
    }

    @Test
    public void Given_TypeRecordsExist_When_GetTotalTypeRecords_Then_TheTotalCountOfTypeRecordsWillBeReturned() {

        webTestClient
                .get()
                .uri(uriBuilder ->
                        uriBuilder
                                .path("/api/v1/types/test/total")
                                .build())
                .exchange()
                .expectStatus().isOk()
                .expectBody(Long.class)
                .value(response -> Assertions.assertThat(response).isEqualTo(3L));
    }


    @Test
    public void Given_TypeRecordsExist_When_GetTotalTypeRecordsCorrespondingToAFilter_Then_TheTotalCountOfFilteredTypeRecordsWillBeReturned() {

        webTestClient
                .get()
                .uri(uriBuilder ->
                        uriBuilder
                                .path("/api/v1/types/test/total")
                                .queryParam("name", "{param1}")
                                .build("Thi"))
                .exchange()
                .expectStatus().isOk()
                .expectBody(Long.class)
                .value(response -> Assertions.assertThat(response).isEqualTo(1L));
    }

}

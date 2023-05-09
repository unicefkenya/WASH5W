/*
 * Copyright (C) 2021 Second Mile
 *
 * This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0.
 * If a copy of the MPL was not distributed with this file,
 * You can obtain one at http://mozilla.org/MPL/2.0/.
 */
package ke.co.miles.levels;

import ke.co.miles.levels.models.Level;
import ke.co.miles.levels.util.builders.LevelBuilder;
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
@ContextConfiguration(initializers = RetrieveLevelsIT.Initializer.class)
public class RetrieveLevelsIT {

    @Autowired
    WebTestClient webTestClient;

    static final PostgreSQLContainer postgreSQLContainer;
    static final Level level1;
    static final Level level2;
    static final Level level3;

    static {

        postgreSQLContainer =
                new PostgreSQLContainer("postgres:10.15")
                        .withDatabaseName("test")
                        .withUsername("postgres")
                        .withPassword("postgres");

        postgreSQLContainer
                .withInitScript("init.sql")
                .start();

        level1 =
                new LevelBuilder()
                        .id(1L)
                        .data("{\"index\": 1, \"name\": \"First Level\", \"valid\": true}")
                        .version(1)
                        .build();

        level2 =
                new LevelBuilder()
                        .id(2L)
                        .data("{\"index\": 2, \"name\": \"Second Level\", \"valid\": true}")
                        .version(1)
                        .build();

        level3 =
                new LevelBuilder()
                        .id(3L)
                        .data("{\"index\": 3, \"name\": \"Third Level\", \"valid\": false}")
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
    public void Given_LevelRecordsExist_When_GetAllWithIdsFilter_Then_OnlyLevelRecordsWithTheSpecifiedIdsWillBeReturned() {

        webTestClient
                .get()
                .uri(uriBuilder ->
                        uriBuilder
                                .path("/api/v1/levels/test/all")
                                .queryParam("ids", "{id1}", "{id2}")
                                .build(level1.getId().toString(), level3.getId().toString()))
                .exchange()
                .expectStatus().isOk()
                .expectBodyList(Level.class)
                .value(response -> {

                            Collections.sort(response);

                            Assertions.assertThat(response.get(0).getId()).isEqualTo(level1.getId());
                            try {
                                JSONAssert.assertEquals(level1.getData(), response.get(0).getData(), false);
                            } catch (JSONException e) {
                                throw new RuntimeException(e);
                            }
                            Assertions.assertThat(response.get(0).getVersion()).isEqualTo(level1.getVersion());


                            Assertions.assertThat(response.get(1).getId()).isEqualTo(level3.getId());
                            try {
                                JSONAssert.assertEquals(level3.getData(), response.get(1).getData(), false);
                            } catch (JSONException e) {
                                throw new RuntimeException(e);
                            }
                            Assertions.assertThat(response.get(1).getVersion()).isEqualTo(level3.getVersion());

                        }
                );
    }

    @Test
    public void Given_LevelRecordsExist_When_GetAllWithOtherNumericValuedFilter_Then_OnlyLevelRecordsWithTheSpecifiedNumberWillBeReturned() {

        webTestClient
                .get()
                .uri(uriBuilder ->
                        uriBuilder
                                .path("/api/v1/levels/test/all")
                                .queryParam("index", "{param1}")
                                .build("3"))
                .exchange()
                .expectStatus().isOk()
                .expectBodyList(Level.class)
                .value(response -> {

                            Collections.sort(response);

                            Assertions.assertThat(response.get(0).getId()).isEqualTo(level3.getId());
                            try {
                                JSONAssert.assertEquals(level3.getData(), response.get(0).getData(), false);
                            } catch (JSONException e) {
                                throw new RuntimeException(e);
                            }
                            Assertions.assertThat(response.get(0).getVersion()).isEqualTo(1);


                        }
                );
    }

    @Test
    public void Given_LevelRecordsExist_When_GetAllWithOtherStringValuedFilter_Then_OnlyLevelRecordsWithTheSpecifiedStringValueWillBeReturned() {

        webTestClient
                .get()
                .uri(uriBuilder ->
                        uriBuilder
                                .path("/api/v1/levels/test/all")
                                .queryParam("name", "{param1}")
                                .build("Thi"))
                .exchange()
                .expectStatus().isOk()
                .expectBodyList(Level.class)
                .value(response -> {

                            Collections.sort(response);

                            Assertions.assertThat(response.get(0).getId()).isEqualTo(level3.getId());
                            try {
                                JSONAssert.assertEquals(level3.getData(), response.get(0).getData(), false);
                            } catch (JSONException e) {
                                throw new RuntimeException(e);
                            }
                            Assertions.assertThat(response.get(0).getVersion()).isEqualTo(1);


                        }
                );
    }


    @Test
    public void Given_LevelRecordsExist_When_GetAllWithOtherBooleanValuedFilter_Then_OnlyLevelRecordsWithTheSpecifiedBooleanWillBeReturned() {

        webTestClient
                .get()
                .uri(uriBuilder ->
                        uriBuilder
                                .path("/api/v1/levels/test/all")
                                .queryParam("valid", "{param1}")
                                .build("false"))
                .exchange()
                .expectStatus().isOk()
                .expectBodyList(Level.class)
                .value(response -> {

                            Collections.sort(response);

                            Assertions.assertThat(response.get(0).getId()).isEqualTo(level3.getId());
                            try {
                                JSONAssert.assertEquals(level3.getData(), response.get(0).getData(), false);
                            } catch (JSONException e) {
                                throw new RuntimeException(e);
                            }
                            Assertions.assertThat(response.get(0).getVersion()).isEqualTo(1);


                        }
                );
    }


    @Test
    public void Given_LevelRecordsExist_When_GetAllWithoutFilters_Then_AllLevelRecordsWillBeReturned() {

        webTestClient
                .get()
                .uri(uriBuilder ->
                        uriBuilder
                                .path("/api/v1/levels/test/all")
                                .build())
                .exchange()
                .expectStatus().isOk()
                .expectBodyList(Level.class)
                .value(response -> {

                            Collections.sort(response);

                            Assertions.assertThat(response.get(0).getId()).isEqualTo(level1.getId());
                            try {
                                JSONAssert.assertEquals(level1.getData(), response.get(0).getData(), false);
                            } catch (JSONException e) {
                                throw new RuntimeException(e);
                            }
                            Assertions.assertThat(response.get(0).getVersion()).isEqualTo(level1.getVersion());


                            Assertions.assertThat(response.get(1).getId()).isEqualTo(level2.getId());
                            try {
                                JSONAssert.assertEquals(level2.getData(), response.get(1).getData(), false);
                            } catch (JSONException e) {
                                throw new RuntimeException(e);
                            }
                            Assertions.assertThat(response.get(1).getVersion()).isEqualTo(level2.getVersion());


                            Assertions.assertThat(response.get(2).getId()).isEqualTo(level3.getId());
                            try {
                                JSONAssert.assertEquals(level3.getData(), response.get(2).getData(), false);
                            } catch (JSONException e) {
                                throw new RuntimeException(e);
                            }
                            Assertions.assertThat(response.get(2).getVersion()).isEqualTo(level3.getVersion());


                        }
                );
    }

    @Test
    public void Given_LevelRecordsExist_When_GetTotalLevelRecords_Then_TheTotalCountOfLevelRecordsWillBeReturned() {

        webTestClient
                .get()
                .uri(uriBuilder ->
                        uriBuilder
                                .path("/api/v1/levels/test/total")
                                .build())
                .exchange()
                .expectStatus().isOk()
                .expectBody(Long.class)
                .value(response -> Assertions.assertThat(response).isEqualTo(3L));
    }


    @Test
    public void Given_LevelRecordsExist_When_GetTotalLevelRecordsCorrespondingToAFilter_Then_TheTotalCountOfFilteredLevelRecordsWillBeReturned() {

        webTestClient
                .get()
                .uri(uriBuilder ->
                        uriBuilder
                                .path("/api/v1/levels/test/total")
                                .queryParam("name", "{param1}")
                                .build("Thi"))
                .exchange()
                .expectStatus().isOk()
                .expectBody(Long.class)
                .value(response -> Assertions.assertThat(response).isEqualTo(1L));
    }

}

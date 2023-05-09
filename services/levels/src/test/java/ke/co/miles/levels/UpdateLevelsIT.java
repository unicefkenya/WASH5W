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
import org.springframework.http.MediaType;
import org.springframework.test.context.ContextConfiguration;
import org.springframework.test.web.reactive.server.WebTestClient;
import org.testcontainers.containers.PostgreSQLContainer;
import org.testcontainers.junit.jupiter.Testcontainers;
import reactor.core.publisher.Flux;

import java.util.Arrays;
import java.util.Collections;

/**
 * @author Kwaje Anthony <tony@miles.co.ke>
 * @version 1.0
 * @since 1.0
 */
@Testcontainers
@SpringBootTest(webEnvironment = WebEnvironment.RANDOM_PORT)
@AutoConfigureWebTestClient
@ContextConfiguration(initializers = UpdateLevelsIT.Initializer.class)
public class UpdateLevelsIT {

    @Autowired
    WebTestClient webTestClient;

    static final PostgreSQLContainer postgreSQLContainer;

    static final Level level1;

    static final Level level2;

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
                        .data("{\"index\": 1, \"name\": \"FIRST ENTITY\", \"valid\": true}")
                        .version(1)
                        .build();

        level2 =
                new LevelBuilder()
                        .id(2L)
                        .data("{\"index\": 2, \"name\": \"SECOND ENTITY\", \"valid\": false}")
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
    public void Given_ModifiedDetailsOfExistingRecords_When_PutAll_Then_TheRecordsWillBeUpdatedAndReturnedWithTheirVersionsIncrementedByOne() {

        webTestClient
                .put()
                .uri("/api/v1/levels/test/all")
                .contentType(MediaType.APPLICATION_JSON)
                .body(Flux.fromIterable(Arrays.asList(level1, level2)), Level.class)
                .exchange()
                .expectStatus()
                .isOk()
                .expectBodyList(Level.class)
                .value(response -> {

                            Collections.sort(response);

                            Assertions.assertThat(response.get(0).getId()).isEqualTo(level1.getId());
                            try {
                                JSONAssert.assertEquals(level1.getData(), response.get(0).getData(), false);
                            } catch (JSONException e) {
                                throw new RuntimeException(e);
                            }
                            Assertions.assertThat(response.get(0).getVersion()).isEqualTo(level1.getVersion() + 1);


                            Assertions.assertThat(response.get(1).getId()).isEqualTo(level2.getId());
                            try {
                                JSONAssert.assertEquals(level2.getData(), response.get(1).getData(), false);
                            } catch (JSONException e) {
                                throw new RuntimeException(e);
                            }
                            Assertions.assertThat(response.get(1).getVersion()).isEqualTo(level2.getVersion() + 1);


                        }
                );
    }
}

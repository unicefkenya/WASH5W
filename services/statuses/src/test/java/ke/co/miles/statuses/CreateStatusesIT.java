/*
 * Copyright (C) 2021 Second Mile
 *
 * This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0.
 * If a copy of the MPL was not distributed with this file,
 * You can obtain one at http://mozilla.org/MPL/2.0/.
 */
package ke.co.miles.statuses;

import ke.co.miles.statuses.models.Status;
import ke.co.miles.statuses.util.builders.StatusBuilder;
import org.assertj.core.api.Assertions;
import org.hamcrest.MatcherAssert;
import org.hamcrest.Matchers;
import org.jetbrains.annotations.NotNull;
import org.junit.AfterClass;
import org.junit.jupiter.api.Test;
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
@ContextConfiguration(initializers = CreateStatusesIT.Initializer.class)
public class CreateStatusesIT {

    @Autowired
    WebTestClient webTestClient;

    static final PostgreSQLContainer postgreSQLContainer;

    static final Status status4;

    static final Status status5;

    static {

        postgreSQLContainer =
                new PostgreSQLContainer("postgres:10.15")
                        .withDatabaseName("test")
                        .withUsername("postgres")
                        .withPassword("postgres");

        postgreSQLContainer
                .withInitScript("init.sql")
                .start();

        status4 =
                new StatusBuilder()
                        .id(null)
                        .data("{\"index\": 4, \"name\": \"Status 4\", \"valid\": false}")
                        .version(null)
                        .build();

        status5 =
                new StatusBuilder()
                        .id(null)
                        .data("{\"index\": 5, \"name\": \"Status 5\", \"valid\": true}")
                        .version(null)
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
    public void Given_StatusDetailsList_When_PostAll_Then_StatusRecordsWillBeCreatedAndReturned() {

        webTestClient
                .post()
                .uri("/api/v1/statuses/test/all")
                .contentType(MediaType.APPLICATION_JSON)
                .body(Flux.fromIterable(Arrays.asList(status4, status5)), Status.class)
                .exchange()
                .expectStatus().isCreated()
                .expectBodyList(Status.class)
                .value(response -> {

                    Collections.sort(response);

                    Assertions.assertThat(response.get(0).getId()).isEqualTo(4L);
                    MatcherAssert.assertThat(response.get(0).getData(), Matchers.either(Matchers.is(status4.getData())).or(Matchers.is(status5.getData())));
                    Assertions.assertThat(response.get(0).getVersion()).isEqualTo(1);

                    Assertions.assertThat(response.get(1).getId()).isEqualTo(5L);
                    MatcherAssert.assertThat(response.get(1).getData(), Matchers.either(Matchers.is(status4.getData())).or(Matchers.is(status5.getData())));
                    Assertions.assertThat(response.get(1).getVersion()).isEqualTo(1);

                });
    }
}

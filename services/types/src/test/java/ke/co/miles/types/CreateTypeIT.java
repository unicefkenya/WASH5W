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
import reactor.core.publisher.Mono;

/**
 * @author Kwaje Anthony <tony@miles.co.ke>
 * @version 1.0
 * @since 1.0
 */
@Testcontainers
@SpringBootTest(webEnvironment = WebEnvironment.RANDOM_PORT)
@AutoConfigureWebTestClient
@ContextConfiguration(initializers = CreateTypeIT.Initializer.class)
public class CreateTypeIT {

    @Autowired
    WebTestClient webTestClient;

    static final PostgreSQLContainer postgreSQLContainer;

    static final Type type4;

    static {

        postgreSQLContainer =
                new PostgreSQLContainer("postgres:10.15")
                        .withDatabaseName("test")
                        .withUsername("postgres")
                        .withPassword("postgres");

        postgreSQLContainer
                .withInitScript("init.sql")
                .start();

        type4 =
                new TypeBuilder()
                        .id(null)
                        .data("{\"index\": 4, \"name\": \"Type 4\", \"valid\": false}")
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
    public void Given_TypeDetails_When_Post_Then_TypeRecordWillBeCreatedAndReturned() {

        webTestClient
                .post()
                .uri("/api/v1/types/test")
                .contentType(MediaType.APPLICATION_JSON)
                .body(Mono.just(type4), Type.class)
                .exchange()
                .expectStatus().isCreated()
                .expectBody(Type.class)
                .value(response -> {
                            Assertions.assertThat(response.getId()).isEqualTo(4L);
                            Assertions.assertThat(response.getData()).isEqualTo(type4.getData());
                            Assertions.assertThat(response.getVersion()).isEqualTo(1);
                        }
                );
    }
}

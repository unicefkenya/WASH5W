/*
 * Copyright (C) 2021 Second Mile
 *
 * This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0.
 * If a copy of the MPL was not distributed with this file,
 * You can obtain one at http://mozilla.org/MPL/2.0/.
 */
package ke.co.miles.roles;

import ke.co.miles.roles.models.Role;
import ke.co.miles.roles.util.builders.RoleBuilder;
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
@ContextConfiguration(initializers = CreateRoleIT.Initializer.class)
public class CreateRoleIT {

    @Autowired
    WebTestClient webTestClient;

    static final PostgreSQLContainer postgreSQLContainer;

    static final Role role4;

    static {

        postgreSQLContainer =
                new PostgreSQLContainer("postgres:10.15")
                        .withDatabaseName("test")
                        .withUsername("postgres")
                        .withPassword("postgres");

        postgreSQLContainer
                .withInitScript("init.sql")
                .start();

        role4 =
                new RoleBuilder()
                        .id(null)
                        .data("{\"index\": 4, \"name\": \"Role 4\", \"valid\": false}")
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
    public void Given_RoleDetails_When_Post_Then_RoleRecordWillBeCreatedAndReturned() {

        webTestClient
                .post()
                .uri("/api/v1/roles/test")
                .contentType(MediaType.APPLICATION_JSON)
                .body(Mono.just(role4), Role.class)
                .exchange()
                .expectStatus().isCreated()
                .expectBody(Role.class)
                .value(response -> {
                            Assertions.assertThat(response.getId()).isEqualTo(4L);
                            Assertions.assertThat(response.getData()).isEqualTo(role4.getData());
                            Assertions.assertThat(response.getVersion()).isEqualTo(1);
                        }
                );
    }
}

/*
 * Copyright (C) 2021 Second Mile
 *
 * This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0.
 * If a copy of the MPL was not distributed with this file,
 * You can obtain one at http://mozilla.org/MPL/2.0/.
 */
package ke.co.miles.accountabilitieshierarchies;

import ke.co.miles.accountabilitieshierarchies.models.AccountabilityHierarchy;
import ke.co.miles.accountabilitieshierarchies.util.builders.AccountabilityHierarchyBuilder;
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
@ContextConfiguration(initializers = CreateAccountabilityHierarchyIT.Initializer.class)
public class CreateAccountabilityHierarchyIT {

    @Autowired
    WebTestClient webTestClient;

    static final PostgreSQLContainer postgreSQLContainer;

    static final AccountabilityHierarchy accountabilityHierarchy4;

    static {

        postgreSQLContainer =
                new PostgreSQLContainer("postgres:10.15")
                        .withDatabaseName("test")
                        .withUsername("postgres")
                        .withPassword("postgres");

        postgreSQLContainer
                .withInitScript("init.sql")
                .start();

        accountabilityHierarchy4 =
                new AccountabilityHierarchyBuilder()
                        .id(null)
                        .data("{\"index\": 4, \"name\": \"Fourth Accountability Hierarchy\", \"valid\": false}")
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
    public void Given_AccountabilityHierarchyDetails_When_Post_Then_AccountabilityHierarchyRecordWillBeCreatedAndReturned() {

        webTestClient
                .post()
                .uri("/api/v1/accountabilities_hierarchies/test")
                .contentType(MediaType.APPLICATION_JSON)
                .body(Mono.just(accountabilityHierarchy4), AccountabilityHierarchy.class)
                .exchange()
                .expectStatus().isCreated()
                .expectBody(AccountabilityHierarchy.class)
                .value(response -> {
                            Assertions.assertThat(response.getId()).isEqualTo(4L);
                            Assertions.assertThat(response.getData()).isEqualTo(accountabilityHierarchy4.getData());
                            Assertions.assertThat(response.getVersion()).isEqualTo(1);
                        }
                );
    }
}

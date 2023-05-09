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
@ContextConfiguration(initializers = CreateAccountabilitiesHierarchiesIT.Initializer.class)
public class CreateAccountabilitiesHierarchiesIT {

    @Autowired
    WebTestClient webTestClient;

    static final PostgreSQLContainer postgreSQLContainer;

    static final AccountabilityHierarchy accountabilityHierarchy4;

    static final AccountabilityHierarchy accountabilityHierarchy5;

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
                        .data("{\"index\": 4, \"name\": \"Fourth AccountabilityHierarchy\", \"valid\": false}")
                        .version(null)
                        .build();

        accountabilityHierarchy5 =
                new AccountabilityHierarchyBuilder()
                        .id(null)
                        .data("{\"index\": 5, \"name\": \"Fifth Accountability Hierarchy\", \"valid\": true}")
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
    public void Given_AccountabilityHierarchyDetailsList_When_PostAll_Then_AccountabilityHierarchyRecordsWillBeCreatedAndReturned() {

        webTestClient
                .post()
                .uri("/api/v1/accountabilities_hierarchies/test/all")
                .contentType(MediaType.APPLICATION_JSON)
                .body(Flux.fromIterable(Arrays.asList(accountabilityHierarchy4, accountabilityHierarchy5)), AccountabilityHierarchy.class)
                .exchange()
                .expectStatus().isCreated()
                .expectBodyList(AccountabilityHierarchy.class)
                .value(response -> {

                    Collections.sort(response);

                    Assertions.assertThat(response.get(0).getId()).isEqualTo(4L);
                    MatcherAssert.assertThat(response.get(0).getData(), Matchers.either(Matchers.is(accountabilityHierarchy4.getData())).or(Matchers.is(accountabilityHierarchy5.getData())));
                    Assertions.assertThat(response.get(0).getVersion()).isEqualTo(1);

                    Assertions.assertThat(response.get(1).getId()).isEqualTo(5L);
                    MatcherAssert.assertThat(response.get(1).getData(), Matchers.either(Matchers.is(accountabilityHierarchy4.getData())).or(Matchers.is(accountabilityHierarchy5.getData())));
                    Assertions.assertThat(response.get(1).getVersion()).isEqualTo(1);

                });
    }
}

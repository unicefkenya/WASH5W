/*
 * Copyright (C) 2021 Second Mile
 *
 * This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0.
 * If a copy of the MPL was not distributed with this file,
 * You can obtain one at http://mozilla.org/MPL/2.0/.
 */
package ke.co.miles.attributes;

import ke.co.miles.attributes.models.Attribute;
import ke.co.miles.attributes.util.builders.AttributeBuilder;
import org.assertj.core.api.Assertions;
import org.hamcrest.MatcherAssert;
import org.hamcrest.Matchers;
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
@ContextConfiguration(initializers = CreateAttributesIT.Initializer.class)
public class CreateAttributesIT {

    @Autowired
    WebTestClient webTestClient;

    static final PostgreSQLContainer postgreSQLContainer;

    static final Attribute attribute4;

    static final Attribute attribute5;

    static {

        postgreSQLContainer =
                new PostgreSQLContainer("postgres:10.15")
                        .withDatabaseName("test")
                        .withUsername("postgres")
                        .withPassword("postgres");

        postgreSQLContainer
                .withInitScript("init.sql")
                .start();

        attribute4 =
                new AttributeBuilder()
                        .id(null)
                        .data("{\"index\": 4, \"name\": \"Attribute 4\", \"valid\": false}")
                        .version(null)
                        .build();

        attribute5 =
                new AttributeBuilder()
                        .id(null)
                        .data("{\"index\": 5, \"name\": \"Attribute 5\", \"valid\": true}")
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
    public void Given_AttributeDetailsList_When_PostAll_Then_AttributeRecordsWillBeCreatedAndReturned() {

        webTestClient
                .post()
                .uri("/api/v1/attributes/test/all")
                .contentType(MediaType.APPLICATION_JSON)
                .body(Flux.fromIterable(Arrays.asList(attribute4, attribute5)), Attribute.class)
                .exchange()
                .expectStatus().isCreated()
                .expectBodyList(Attribute.class)
                .value(response -> {

                    Collections.sort(response);

                    Assertions.assertThat(response.get(0).getId()).isEqualTo(4L);
                    MatcherAssert.assertThat(response.get(0).getData(), Matchers.either(Matchers.is(attribute4.getData())).or(Matchers.is(attribute5.getData())));
                    Assertions.assertThat(response.get(0).getVersion()).isEqualTo(1);

                    Assertions.assertThat(response.get(1).getId()).isEqualTo(5L);
                    MatcherAssert.assertThat(response.get(1).getData(), Matchers.either(Matchers.is(attribute4.getData())).or(Matchers.is(attribute5.getData())));
                    Assertions.assertThat(response.get(1).getVersion()).isEqualTo(1);

                });
    }
}

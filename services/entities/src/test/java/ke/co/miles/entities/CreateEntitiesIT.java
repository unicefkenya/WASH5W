/*
 * Copyright (C) 2021 Second Mile
 *
 * This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0.
 * If a copy of the MPL was not distributed with this file,
 * You can obtain one at http://mozilla.org/MPL/2.0/.
 */
package ke.co.miles.entities;

import java.util.Arrays;
import java.util.Collections;
import ke.co.miles.entities.models.Entity;
import ke.co.miles.entities.util.builders.EntityBuilder;
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

/**
 * @author Kwaje Anthony <tony@miles.co.ke>
 * @version 1.0
 * @since 1.0
 */
@Testcontainers
@SpringBootTest(webEnvironment = WebEnvironment.RANDOM_PORT)
@AutoConfigureWebTestClient
@ContextConfiguration(initializers = CreateEntitiesIT.Initializer.class)
public class CreateEntitiesIT {

  static final PostgreSQLContainer postgreSQLContainer;
  static final Entity entity4;
  static final Entity entity5;

  static {

    postgreSQLContainer =
        new PostgreSQLContainer("postgres:10.15")
            .withDatabaseName("test")
            .withUsername("postgres")
            .withPassword("postgres");

    postgreSQLContainer
        .withInitScript("init.sql")
        .start();

    entity4 =
        new EntityBuilder()
            .id(null)
            .data(
                "{\"index\": 4, \"name\": \"Entity 4\", \"valid\": false, \"types\": [4], \"groups\": [4], \"roles\": [4], \"levels\": [4], \"statuses\": [4], \"locations\": [4]}")
            .version(null)
            .build();

    entity5 =
        new EntityBuilder()
            .id(null)
            .data(
                "{\"index\": 5, \"name\": \"Entity 5\", \"valid\": true, \"types\": [5], \"groups\": [5], \"roles\": [5], \"levels\": [5], \"statuses\": [5], \"locations\": [5]}")
            .version(null)
            .build();
  }

  @Autowired
  WebTestClient webTestClient;

  @AfterClass
  public static void shutdown() {

    postgreSQLContainer.stop();
  }

  @Test
  public void Given_EntityDetailsList_When_PostAll_Then_EntityRecordsWillBeCreatedAndReturned() {

    webTestClient
        .post()
        .uri("/api/v1/entities/test/all")
        .contentType(MediaType.APPLICATION_JSON)
        .body(Flux.fromIterable(Arrays.asList(entity4, entity5)), Entity.class)
        .exchange()
        .expectStatus().isCreated()
        .expectBodyList(Entity.class)
        .value(response -> {

          Collections.sort(response);

          Assertions.assertThat(response.get(0).getId()).isEqualTo(4L);
          MatcherAssert.assertThat(response.get(0).getData(),
              Matchers.either(Matchers.is(entity4.getData())).or(Matchers.is(entity5.getData())));
          Assertions.assertThat(response.get(0).getVersion()).isEqualTo(1);

          Assertions.assertThat(response.get(1).getId()).isEqualTo(5L);
          MatcherAssert.assertThat(response.get(1).getData(),
              Matchers.either(Matchers.is(entity4.getData())).or(Matchers.is(entity5.getData())));
          Assertions.assertThat(response.get(1).getVersion()).isEqualTo(1);

        });
  }

  public static class Initializer implements
      ApplicationContextInitializer<ConfigurableApplicationContext> {

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
}

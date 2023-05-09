/*
 * Copyright (C) 2021 Second Mile
 *
 * This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0.
 * If a copy of the MPL was not distributed with this file,
 * You can obtain one at http://mozilla.org/MPL/2.0/.
 */
package ke.co.miles.accountabilities;

import java.util.Arrays;
import java.util.Collections;
import ke.co.miles.accountabilities.models.Accountability;
import ke.co.miles.accountabilities.util.builders.AccountabilityBuilder;
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
@ContextConfiguration(initializers = CreateAccountabilitiesIT.Initializer.class)
public class CreateAccountabilitiesIT {

  @Autowired
  WebTestClient webTestClient;

  static final PostgreSQLContainer postgreSQLContainer;

  static final Accountability accountability6;

  static final Accountability accountability7;

  static {

    postgreSQLContainer =
        new PostgreSQLContainer("postgres:10.15")
            .withDatabaseName("test")
            .withUsername("postgres")
            .withPassword("postgres");

    postgreSQLContainer
        .withInitScript("init.sql")
        .start();

    accountability6 =
        new AccountabilityBuilder()
            .id(null)
            .data(
                "{\"type\": {\"id\": 6}, \"commissioner\": {\"id\": 60, \"name\": \"Sixtieth\"}, \"responsible\": {\"id\": 600, \"name\": \"Six Hundredth\"}}")
            .version(null)
            .build();

    accountability7 =
        new AccountabilityBuilder()
            .id(null)
            .data(
                "{\"type\": {\"id\": 7}, \"commissioner\": {\"id\": 70, \"name\": \"Seventieth\"}, \"responsible\": {\"id\": 700, \"name\": \"Seven Hundredth\"}}")
            .version(null)
            .build();
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

  @AfterClass
  public static void shutdown() {

    postgreSQLContainer.stop();
  }

  @Test
  public void Given_AccountabilityDetailsList_When_PostAll_Then_AccountabilityRecordsWillBeCreatedAndReturned() {

    webTestClient
        .post()
        .uri("/api/v1/accountabilities/test/all")
        .contentType(MediaType.APPLICATION_JSON)
        .body(Flux.fromIterable(Arrays.asList(accountability6, accountability7)),
            Accountability.class)
        .exchange()
        .expectStatus().isCreated()
        .expectBodyList(Accountability.class)
        .value(response -> {

          Assertions.assertThat(response.size()).isEqualTo(2);

          Collections.sort(response);

          Assertions.assertThat(response.get(0).getId()).isEqualTo(6L);
          MatcherAssert.assertThat(response.get(0).getData(),
              Matchers.either(Matchers.is(accountability6.getData()))
                  .or(Matchers.is(accountability7.getData())));
          Assertions.assertThat(response.get(0).getVersion()).isEqualTo(1);

          Assertions.assertThat(response.get(1).getId()).isEqualTo(7L);
          MatcherAssert.assertThat(response.get(1).getData(),
              Matchers.either(Matchers.is(accountability6.getData()))
                  .or(Matchers.is(accountability7.getData())));
          Assertions.assertThat(response.get(1).getVersion()).isEqualTo(1);

        });
  }
}

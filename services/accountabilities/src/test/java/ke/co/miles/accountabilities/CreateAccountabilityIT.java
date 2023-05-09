/*
 * Copyright (C) 2021 Second Mile
 *
 * This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0.
 * If a copy of the MPL was not distributed with this file,
 * You can obtain one at http://mozilla.org/MPL/2.0/.
 */
package ke.co.miles.accountabilities;

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
import reactor.core.publisher.Mono;

/**
 * @author Kwaje Anthony <tony@miles.co.ke>
 * @version 1.0
 * @since 1.0
 */
@Testcontainers
@SpringBootTest(webEnvironment = WebEnvironment.RANDOM_PORT)
@AutoConfigureWebTestClient
@ContextConfiguration(initializers = CreateAccountabilityIT.Initializer.class)
public class CreateAccountabilityIT {

  @Autowired
  WebTestClient webTestClient;

  static final PostgreSQLContainer postgreSQLContainer;

  static final Accountability accountability6;

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
    
  }

  public static class Initializer implements
      ApplicationContextInitializer<ConfigurableApplicationContext> {

    @Override
    public void initialize(@NotNull ConfigurableApplicationContext configurableApplicationContext) {
      TestPropertyValues values = TestPropertyValues.of(
          "database.host=" + postgreSQLContainer.getHost(),
          "database.port=" + postgreSQLContainer.getFirstMappedPort(),
          "database.username=" + postgreSQLContainer.getUsername(),
          "database.password=" + postgreSQLContainer.getPassword());
      values.applyTo(configurableApplicationContext);
    }
  }

  @AfterClass
  public static void shutdown() {

    postgreSQLContainer.stop();
  }

  @Test
  public void Given_AccountabilityDetails_When_Post_Then_AccountabilityRecordWillBeCreatedAndReturned() {

    webTestClient.post().uri("/api/v1/accountabilities/test")
        .contentType(MediaType.APPLICATION_JSON)
        .body(Mono.just(accountability6), Accountability.class).exchange().expectStatus()
        .isCreated().expectBody(Accountability.class).value(response -> {
          
          Assertions.assertThat(response.getId()).isEqualTo(6L);
          Assertions.assertThat(response.getId()).isEqualTo(6L);
          MatcherAssert.assertThat(response.getData(),
              Matchers.either(Matchers.is(accountability6.getData()))
                  .or(Matchers.is(accountability6.getData())));
          Assertions.assertThat(response.getVersion()).isEqualTo(1);
        });
  }
}

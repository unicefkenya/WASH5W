/*
 * Copyright (C) 2021 Second Mile
 *
 * This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0.
 * If a copy of the MPL was not distributed with this file,
 * You can obtain one at http://mozilla.org/MPL/2.0/.
 */
package ke.co.miles.logicalschemes;

import ke.co.miles.logicalschemes.models.LogicalScheme;
import ke.co.miles.logicalschemes.util.builders.LogicalSchemeBuilder;
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
@ContextConfiguration(initializers = CreateLogicalSchemeIT.Initializer.class)
public class CreateLogicalSchemeIT {

  static final PostgreSQLContainer postgreSQLContainer;
  static final LogicalScheme logicalScheme4;

  static {

    postgreSQLContainer =
        new PostgreSQLContainer("postgres:10.15")
            .withDatabaseName("test")
            .withUsername("postgres")
            .withPassword("postgres");

    postgreSQLContainer
        .withInitScript("init.sql")
        .start();

    logicalScheme4 =
        new LogicalSchemeBuilder()
            .id(null)
            .data(
                "{\"name\":\"Fourth Logical Scheme Name\"}")
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
  public void Given_LogicalSchemeDetails_When_Post_Then_LogicalSchemeRecordWillBeCreatedAndReturned() {

    webTestClient
        .post()
        .uri("/api/v1/logical_schemes")
        .contentType(MediaType.APPLICATION_JSON)
        .body(Mono.just(logicalScheme4), LogicalScheme.class)
        .exchange()
        .expectStatus().isCreated()
        .expectBody(LogicalScheme.class)
        .value(response -> {
              Assertions.assertThat(response.getId()).isEqualTo(4L);
              Assertions.assertThat(response.getData()).isEqualTo(logicalScheme4.getData());
              Assertions.assertThat(response.getVersion()).isEqualTo(1);
            }
        );
  }

  public static class Initializer implements
      ApplicationContextInitializer<ConfigurableApplicationContext> {

    @Override
    public void initialize(@NotNull ConfigurableApplicationContext configurableApplicationContext) {
      TestPropertyValues values = TestPropertyValues.of(
          "database.name=" + postgreSQLContainer.getDatabaseName(),
          "database.host=" + postgreSQLContainer.getHost(),
          "database.port=" + postgreSQLContainer.getFirstMappedPort(),
          "database.username=" + postgreSQLContainer.getUsername(),
          "database.password=" + postgreSQLContainer.getPassword()
      );
      values.applyTo(configurableApplicationContext);
    }
  }
}

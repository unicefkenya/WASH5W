/*
 * Copyright (C) 2021 Second Mile
 *
 * This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0.
 * If a copy of the MPL was not distributed with this file,
 * You can obtain one at http://mozilla.org/MPL/2.0/.
 */
package ke.co.miles.logicalhierarchies;

import ke.co.miles.logicalhierarchies.models.LogicalHierarchy;
import ke.co.miles.logicalhierarchies.util.builders.LogicalHierarchyBuilder;
import org.assertj.core.api.Assertions;
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
import reactor.core.publisher.Mono;

/**
 * @author Kwaje Anthony <tony@miles.co.ke>
 * @version 1.0
 * @since 1.0
 */
@Testcontainers
@SpringBootTest(webEnvironment = WebEnvironment.RANDOM_PORT)
@AutoConfigureWebTestClient
@ContextConfiguration(initializers = UpdateLogicalHierarchyIT.Initializer.class)
public class UpdateLogicalHierarchyIT {

  static final PostgreSQLContainer postgreSQLContainer;
  static final LogicalHierarchy logicalHierarchy1;

  static {

    postgreSQLContainer =
        new PostgreSQLContainer("postgres:10.15")
            .withDatabaseName("test")
            .withUsername("postgres")
            .withPassword("postgres");

    postgreSQLContainer
        .withInitScript("init.sql")
        .start();

    logicalHierarchy1 =
        new LogicalHierarchyBuilder()
            .id(1L)
            .data(
                "{\"context\": {\"id\": 1},\"type\": {\"id\": 1,\"name\": \"FIRST Type Name\"},\"commissioner\": {\"id\": null,\"name\": \"First Commissioner Name\"},\"responsible\": {\"id\": 1,\"name\": \"First Responsible Name\"}}")
            .version(1)
            .build();

  }

  @Autowired
  WebTestClient webTestClient;

  @AfterClass
  public static void shutdown() {

    postgreSQLContainer.stop();
  }

  @Test
  public void Given_ModifiedDetailsOfAnExistingRecord_When_Put_Then_TheRecordWillBeUpdatedAndReturnedWithItsVersionIncrementedByOne() {

    webTestClient
        .put()
        .uri("/api/v1/logical_hierarchies/1")
        .contentType(MediaType.APPLICATION_JSON)
        .body(Mono.just(logicalHierarchy1), LogicalHierarchy.class)
        .exchange()
        .expectStatus()
        .isOk()
        .expectBody(LogicalHierarchy.class)
        .value(response -> {
              Assertions.assertThat(response.getId()).isEqualTo(logicalHierarchy1.getId());
              try {
                JSONAssert.assertEquals(logicalHierarchy1.getData(), response.getData(), false);
              } catch (JSONException e) {
                throw new RuntimeException(e);
              }
              Assertions.assertThat(response.getVersion()).isEqualTo(logicalHierarchy1.getVersion() + 1);
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

/*
 * Copyright (C) 2021 Second Mile
 *
 * This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0.
 * If a copy of the MPL was not distributed with this file,
 * You can obtain one at http://mozilla.org/MPL/2.0/.
 */
package ke.co.miles.logicalelementstypes;

import ke.co.miles.logicalelementstypes.models.LogicalElementType;
import ke.co.miles.logicalelementstypes.util.builders.LogicalElementTypeBuilder;
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
@ContextConfiguration(initializers = UpdateLogicalElementTypeIT.Initializer.class)
public class UpdateLogicalElementTypeIT {

  static final PostgreSQLContainer postgreSQLContainer;
  static final LogicalElementType logicalElementType1;

  static {

    postgreSQLContainer =
        new PostgreSQLContainer("postgres:10.15")
            .withDatabaseName("test")
            .withUsername("postgres")
            .withPassword("postgres");

    postgreSQLContainer
        .withInitScript("init.sql")
        .start();

    logicalElementType1 =
        new LogicalElementTypeBuilder()
            .id(1L)
            .data(
                "{\"name\":\"First Logical Element Type Name\",\"plural\":\"First Logical Element Type Names\"}")
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
        .uri("/api/v1/logical_elements_types/1")
        .contentType(MediaType.APPLICATION_JSON)
        .body(Mono.just(logicalElementType1), LogicalElementType.class)
        .exchange()
        .expectStatus()
        .isOk()
        .expectBody(LogicalElementType.class)
        .value(response -> {
              Assertions.assertThat(response.getId()).isEqualTo(logicalElementType1.getId());
              try {
                JSONAssert.assertEquals(logicalElementType1.getData(), response.getData(), false);
              } catch (JSONException e) {
                throw new RuntimeException(e);
              }
              Assertions.assertThat(response.getVersion()).isEqualTo(logicalElementType1.getVersion() + 1);
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

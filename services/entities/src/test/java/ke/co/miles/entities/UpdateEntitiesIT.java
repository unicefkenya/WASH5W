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

/**
 * @author Kwaje Anthony <tony@miles.co.ke>
 * @version 1.0
 * @since 1.0
 */
@Testcontainers
@SpringBootTest(webEnvironment = WebEnvironment.RANDOM_PORT)
@AutoConfigureWebTestClient
@ContextConfiguration(initializers = UpdateEntitiesIT.Initializer.class)
public class UpdateEntitiesIT {

  static final PostgreSQLContainer postgreSQLContainer;
  static final Entity entity1;
  static final Entity entity2;

  static {

    postgreSQLContainer =
        new PostgreSQLContainer("postgres:10.15")
            .withDatabaseName("test")
            .withUsername("postgres")
            .withPassword("postgres");

    postgreSQLContainer
        .withInitScript("init.sql")
        .start();

    entity1 =
        new EntityBuilder()
            .id(1L)
            .data(
                "{\"index\": 1, \"name\": \"FIRST ENTITY\", \"valid\": true, \"types\": [1], \"groups\": [1], \"roles\": [1], \"levels\": [1], \"statuses\": [1], \"locations\": [1]}")
            .version(1)
            .build();

    entity2 =
        new EntityBuilder()
            .id(2L)
            .data(
                "{\"index\": 2, \"name\": \"SECOND ENTITY\", \"valid\": false, \"types\": [2], \"groups\": [2], \"roles\": [2], \"levels\": [2], \"statuses\": [2], \"locations\": [1]}")
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
  public void Given_ModifiedDetailsOfExistingRecords_When_PutAll_Then_TheRecordsWillBeUpdatedAndReturnedWithTheirVersionsIncrementedByOne() {

    webTestClient
        .put()
        .uri("/api/v1/entities/test/all")
        .contentType(MediaType.APPLICATION_JSON)
        .body(Flux.fromIterable(Arrays.asList(entity1, entity2)), Entity.class)
        .exchange()
        .expectStatus()
        .isOk()
        .expectBodyList(Entity.class)
        .value(response -> {

              Collections.sort(response);

              Assertions.assertThat(response.get(0).getId()).isEqualTo(entity1.getId());
              try {
                JSONAssert.assertEquals(entity1.getData(), response.get(0).getData(), false);
              } catch (JSONException e) {
                throw new RuntimeException(e);
              }
              Assertions.assertThat(response.get(0).getVersion()).isEqualTo(entity1.getVersion() + 1);

              Assertions.assertThat(response.get(1).getId()).isEqualTo(entity2.getId());
              try {
                JSONAssert.assertEquals(entity2.getData(), response.get(1).getData(), false);
              } catch (JSONException e) {
                throw new RuntimeException(e);
              }
              Assertions.assertThat(response.get(1).getVersion()).isEqualTo(entity2.getVersion() + 1);


            }
        );
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

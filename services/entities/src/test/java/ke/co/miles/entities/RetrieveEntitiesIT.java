/*
 * Copyright (C) 2021 Second Mile
 *
 * This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0.
 * If a copy of the MPL was not distributed with this file,
 * You can obtain one at http://mozilla.org/MPL/2.0/.
 */
package ke.co.miles.entities;

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
import org.springframework.test.context.ContextConfiguration;
import org.springframework.test.web.reactive.server.WebTestClient;
import org.testcontainers.containers.PostgreSQLContainer;
import org.testcontainers.junit.jupiter.Testcontainers;

/**
 * @author Kwaje Anthony <tony@miles.co.ke>
 * @version 1.0
 * @since 1.0
 */
@Testcontainers
@SpringBootTest(webEnvironment = WebEnvironment.RANDOM_PORT)
@AutoConfigureWebTestClient
@ContextConfiguration(initializers = RetrieveEntitiesIT.Initializer.class)
public class RetrieveEntitiesIT {

  static final PostgreSQLContainer postgreSQLContainer;
  static final Entity entity1;
  static final Entity entity2;
  static final Entity entity3;

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
                "{\"index\": 1, \"name\": \"First Entity\", \"valid\": true, \"types\": [1], \"groups\": [1], \"roles\": [1], \"levels\": [1], \"statuses\": [1], \"locations\": [1]}")
            .version(1)
            .build();

    entity2 =
        new EntityBuilder()
            .id(2L)
            .data(
                "{\"index\": 2, \"name\": \"Second Entity\", \"valid\": true, \"types\": [2], \"groups\": [2], \"roles\": [2], \"levels\": [2], \"statuses\": [2], \"locations\": [2]}")
            .version(1)
            .build();

    entity3 =
        new EntityBuilder()
            .id(3L)
            .data(
                "{\"index\": 3, \"name\": \"Third Entity\", \"valid\": false, \"types\": [3], \"groups\": [3], \"roles\": [3], \"levels\": [3], \"statuses\": [3], \"locations\": [3]}")
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
  public void Given_EntityRecordsExist_When_GetAllWithIdsFilter_Then_OnlyEntityRecordsWithTheSpecifiedIdsWillBeReturned() {

    webTestClient
        .get()
        .uri(uriBuilder ->
            uriBuilder
                .path("/api/v1/entities/test/all")
                .queryParam("ids", "{id1}", "{id2}")
                .build(entity1.getId().toString(), entity3.getId().toString()))
        .exchange()
        .expectStatus().isOk()
        .expectBodyList(Entity.class)
        .value(response -> {

              Collections.sort(response);

              Assertions.assertThat(response.get(0).getId()).isEqualTo(entity1.getId());
              try {
                JSONAssert.assertEquals(entity1.getData(), response.get(0).getData(), false);
              } catch (JSONException e) {
                throw new RuntimeException(e);
              }
              Assertions.assertThat(response.get(0).getVersion()).isEqualTo(entity1.getVersion());

              Assertions.assertThat(response.get(1).getId()).isEqualTo(entity3.getId());
              try {
                JSONAssert.assertEquals(entity3.getData(), response.get(1).getData(), false);
              } catch (JSONException e) {
                throw new RuntimeException(e);
              }
              Assertions.assertThat(response.get(1).getVersion()).isEqualTo(entity3.getVersion());

            }
        );
  }

  @Test
  public void Given_EntityRecordsExist_When_GetAllWithTypeFilter_Then_OnlyEntityRecordsWithTheSpecifiedTypeWillBeReturned() {

    webTestClient
        .get()
        .uri(uriBuilder ->
            uriBuilder
                .path("/api/v1/entities/test/all")
                .queryParam("type", "{param1}")
                .build("3"))
        .exchange()
        .expectStatus().isOk()
        .expectBodyList(Entity.class)
        .value(response -> {

              Collections.sort(response);

              Assertions.assertThat(response.get(0).getId()).isEqualTo(entity3.getId());
              try {
                JSONAssert.assertEquals(entity3.getData(), response.get(0).getData(), false);
              } catch (JSONException e) {
                throw new RuntimeException(e);
              }
              Assertions.assertThat(response.get(0).getVersion()).isEqualTo(1);


            }
        );
  }

  @Test
  public void Given_EntityRecordsExist_When_GetAllWithGroupFilter_Then_OnlyEntityRecordsWithTheSpecifiedGroupWillBeReturned() {

    webTestClient
        .get()
        .uri(uriBuilder ->
            uriBuilder
                .path("/api/v1/entities/test/all")
                .queryParam("group", "{param1}")
                .build("3"))
        .exchange()
        .expectStatus().isOk()
        .expectBodyList(Entity.class)
        .value(response -> {

              Collections.sort(response);

              Assertions.assertThat(response.get(0).getId()).isEqualTo(entity3.getId());
              try {
                JSONAssert.assertEquals(entity3.getData(), response.get(0).getData(), false);
              } catch (JSONException e) {
                throw new RuntimeException(e);
              }
              Assertions.assertThat(response.get(0).getVersion()).isEqualTo(1);


            }
        );
  }

  @Test
  public void Given_EntityRecordsExist_When_GetAllWithRoleFilter_Then_OnlyEntityRecordsWithTheSpecifiedRoleWillBeReturned() {

    webTestClient
        .get()
        .uri(uriBuilder ->
            uriBuilder
                .path("/api/v1/entities/test/all")
                .queryParam("role", "{param1}")
                .build("3"))
        .exchange()
        .expectStatus().isOk()
        .expectBodyList(Entity.class)
        .value(response -> {

              Collections.sort(response);

              Assertions.assertThat(response.get(0).getId()).isEqualTo(entity3.getId());
              try {
                JSONAssert.assertEquals(entity3.getData(), response.get(0).getData(), false);
              } catch (JSONException e) {
                throw new RuntimeException(e);
              }
              Assertions.assertThat(response.get(0).getVersion()).isEqualTo(1);


            }
        );
  }

  @Test
  public void Given_EntityRecordsExist_When_GetAllWithLevelFilter_Then_OnlyEntityRecordsWithTheSpecifiedLevelWillBeReturned() {

    webTestClient
        .get()
        .uri(uriBuilder ->
            uriBuilder
                .path("/api/v1/entities/test/all")
                .queryParam("level", "{param1}")
                .build("3"))
        .exchange()
        .expectStatus().isOk()
        .expectBodyList(Entity.class)
        .value(response -> {

              Collections.sort(response);

              Assertions.assertThat(response.get(0).getId()).isEqualTo(entity3.getId());
              try {
                JSONAssert.assertEquals(entity3.getData(), response.get(0).getData(), false);
              } catch (JSONException e) {
                throw new RuntimeException(e);
              }
              Assertions.assertThat(response.get(0).getVersion()).isEqualTo(1);


            }
        );
  }

  @Test
  public void Given_EntityRecordsExist_When_GetAllWithStatusFilter_Then_OnlyEntityRecordsWithTheSpecifiedStatusWillBeReturned() {

    webTestClient
        .get()
        .uri(uriBuilder ->
            uriBuilder
                .path("/api/v1/entities/test/all")
                .queryParam("status", "{param1}")
                .build("3"))
        .exchange()
        .expectStatus().isOk()
        .expectBodyList(Entity.class)
        .value(response -> {

              Collections.sort(response);

              Assertions.assertThat(response.get(0).getId()).isEqualTo(entity3.getId());
              try {
                JSONAssert.assertEquals(entity3.getData(), response.get(0).getData(), false);
              } catch (JSONException e) {
                throw new RuntimeException(e);
              }
              Assertions.assertThat(response.get(0).getVersion()).isEqualTo(1);


            }
        );
  }

  @Test
  public void Given_EntityRecordsExist_When_GetAllWithLocationFilter_Then_OnlyEntityRecordsWithinTheSpecifiedLocationWillBeReturned() {

    webTestClient
        .get()
        .uri(uriBuilder ->
            uriBuilder
                .path("/api/v1/entities/test/all")
                .queryParam("location", "{param1}")
                .build("3"))
        .exchange()
        .expectStatus().isOk()
        .expectBodyList(Entity.class)
        .value(response -> {

              Collections.sort(response);

              Assertions.assertThat(response.get(0).getId()).isEqualTo(entity3.getId());
              try {
                JSONAssert.assertEquals(entity3.getData(), response.get(0).getData(), false);
              } catch (JSONException e) {
                throw new RuntimeException(e);
              }
              Assertions.assertThat(response.get(0).getVersion()).isEqualTo(1);


            }
        );
  }

  @Test
  public void Given_EntityRecordsExist_When_GetAllWithOtherNumericValuedFilter_Then_OnlyEntityRecordsWithTheSpecifiedNumberWillBeReturned() {

    webTestClient
        .get()
        .uri(uriBuilder ->
            uriBuilder
                .path("/api/v1/entities/test/all")
                .queryParam("index", "{param1}")
                .build("3"))
        .exchange()
        .expectStatus().isOk()
        .expectBodyList(Entity.class)
        .value(response -> {

              Collections.sort(response);

              Assertions.assertThat(response.get(0).getId()).isEqualTo(entity3.getId());
              try {
                JSONAssert.assertEquals(entity3.getData(), response.get(0).getData(), false);
              } catch (JSONException e) {
                throw new RuntimeException(e);
              }
              Assertions.assertThat(response.get(0).getVersion()).isEqualTo(1);


            }
        );
  }

  @Test
  public void Given_EntityRecordsExist_When_GetAllWithOtherStringValuedFilter_Then_OnlyEntityRecordsWithTheSpecifiedStringValueWillBeReturned() {

    webTestClient
        .get()
        .uri(uriBuilder ->
            uriBuilder
                .path("/api/v1/entities/test/all")
                .queryParam("name", "{param1}")
                .build("Thi"))
        .exchange()
        .expectStatus().isOk()
        .expectBodyList(Entity.class)
        .value(response -> {

              Collections.sort(response);

              Assertions.assertThat(response.get(0).getId()).isEqualTo(entity3.getId());
              try {
                JSONAssert.assertEquals(entity3.getData(), response.get(0).getData(), false);
              } catch (JSONException e) {
                throw new RuntimeException(e);
              }
              Assertions.assertThat(response.get(0).getVersion()).isEqualTo(1);


            }
        );
  }

  @Test
  public void Given_EntityRecordsExist_When_GetAllWithOtherBooleanValuedFilter_Then_OnlyEntityRecordsWithTheSpecifiedBooleanWillBeReturned() {

    webTestClient
        .get()
        .uri(uriBuilder ->
            uriBuilder
                .path("/api/v1/entities/test/all")
                .queryParam("valid", "{param1}")
                .build("false"))
        .exchange()
        .expectStatus().isOk()
        .expectBodyList(Entity.class)
        .value(response -> {

              Collections.sort(response);

              Assertions.assertThat(response.get(0).getId()).isEqualTo(entity3.getId());
              try {
                JSONAssert.assertEquals(entity3.getData(), response.get(0).getData(), false);
              } catch (JSONException e) {
                throw new RuntimeException(e);
              }
              Assertions.assertThat(response.get(0).getVersion()).isEqualTo(1);


            }
        );
  }

  @Test
  public void Given_EntityRecordsExist_When_GetAllWithoutFilters_Then_AllEntityRecordsWillBeReturned() {

    webTestClient
        .get()
        .uri(uriBuilder ->
            uriBuilder
                .path("/api/v1/entities/test/all")
                .build())
        .exchange()
        .expectStatus().isOk()
        .expectBodyList(Entity.class)
        .value(response -> {

              Collections.sort(response);

              Assertions.assertThat(response.get(0).getId()).isEqualTo(entity1.getId());
              try {
                JSONAssert.assertEquals(entity1.getData(), response.get(0).getData(), false);
              } catch (JSONException e) {
                throw new RuntimeException(e);
              }
              Assertions.assertThat(response.get(0).getVersion()).isEqualTo(entity1.getVersion());

              Assertions.assertThat(response.get(1).getId()).isEqualTo(entity2.getId());
              try {
                JSONAssert.assertEquals(entity2.getData(), response.get(1).getData(), false);
              } catch (JSONException e) {
                throw new RuntimeException(e);
              }
              Assertions.assertThat(response.get(1).getVersion()).isEqualTo(entity2.getVersion());

              Assertions.assertThat(response.get(2).getId()).isEqualTo(entity3.getId());
              try {
                JSONAssert.assertEquals(entity3.getData(), response.get(2).getData(), false);
              } catch (JSONException e) {
                throw new RuntimeException(e);
              }
              Assertions.assertThat(response.get(2).getVersion()).isEqualTo(entity3.getVersion());


            }
        );
  }

  @Test
  public void Given_EntityRecordsExist_When_GetTotalEntityRecords_Then_TheTotalCountOfEntityRecordsWillBeReturned() {

    webTestClient
        .get()
        .uri(uriBuilder ->
            uriBuilder
                .path("/api/v1/entities/test/total")
                .build())
        .exchange()
        .expectStatus().isOk()
        .expectBody(Long.class)
        .value(response -> Assertions.assertThat(response).isEqualTo(3L));
  }

  @Test
  public void Given_EntityRecordsExist_When_GetTotalEntityRecordsCorrespondingToAFilter_Then_TheTotalCountOfFilteredEntityRecordsWillBeReturned() {

    webTestClient
        .get()
        .uri(uriBuilder ->
            uriBuilder
                .path("/api/v1/entities/test/total")
                .queryParam("name", "{param1}")
                .build("Thi"))
        .exchange()
        .expectStatus().isOk()
        .expectBody(Long.class)
        .value(response -> Assertions.assertThat(response).isEqualTo(1L));
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

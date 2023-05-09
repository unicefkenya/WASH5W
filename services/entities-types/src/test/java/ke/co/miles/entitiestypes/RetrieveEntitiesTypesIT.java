/*
 * Copyright (C) 2021 Second Mile
 *
 * This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0.
 * If a copy of the MPL was not distributed with this file,
 * You can obtain one at http://mozilla.org/MPL/2.0/.
 */
package ke.co.miles.entitiestypes;

import java.util.Collections;
import ke.co.miles.entitiestypes.models.EntityType;
import ke.co.miles.entitiestypes.util.builders.EntityTypeBuilder;
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
@ContextConfiguration(initializers = RetrieveEntitiesTypesIT.Initializer.class)
public class RetrieveEntitiesTypesIT {

  static final PostgreSQLContainer postgreSQLContainer;
  static final EntityType entityType1;
  static final EntityType entityType2;
  static final EntityType entityType3;

  static {

    postgreSQLContainer =
        new PostgreSQLContainer("postgres:10.15")
            .withDatabaseName("test")
            .withUsername("postgres")
            .withPassword("postgres");

    postgreSQLContainer
        .withInitScript("init.sql")
        .start();

    entityType1 =
        new EntityTypeBuilder()
            .id(1L)
            .data(
                "{\"contextId\": 1,\"name\": \"First Entity Type Name\",\"plural\": \"First Entity Type Names\",\"optionsTypesIds\": [9]}")
            .version(1)
            .build();

    entityType2 =
        new EntityTypeBuilder()
            .id(2L)
            .data(
                "{\"contextId\": 1,\"name\": \"Second Entity Type Name\",\"plural\": \"Second Entity Type Names\",\"optionsTypesIds\": [9]}")
            .version(1)
            .build();

    entityType3 =
        new EntityTypeBuilder()
            .id(3L)
            .data(
                "{\"contextId\": 1,\"name\": \"Third Entity Type Name\",\"plural\": \"Third Entity Type Names\",\"optionsTypesIds\": [9]}")
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
  public void Given_EntityTypeRecordsExist_When_GetAllWithNameFilter_Then_OnlyEntityTypeRecordsWithTheSpecifiedNameWillBeReturned() {

    webTestClient
        .get()
        .uri(uriBuilder ->
            uriBuilder
                .path("/api/v1/entities_types")
                .queryParam("name", "{param1}")
                .build("Third Entity Type Name"))
        .exchange()
        .expectStatus().isOk()
        .expectBodyList(EntityType.class)
        .value(response -> {

              Collections.sort(response);

              Assertions.assertThat(response.get(0).getId()).isEqualTo(entityType3.getId());
              try {
                JSONAssert.assertEquals(entityType3.getData(), response.get(0).getData(), false);
              } catch (JSONException e) {
                throw new RuntimeException(e);
              }
              Assertions.assertThat(response.get(0).getVersion()).isEqualTo(1);


            }
        );
  }


  @Test
  public void Given_EntityTypeRecordsExist_When_GetAllWithNameFragmentFilter_Then_OnlyEntityTypeRecordsWithTheSpecifiedNameFragmentWillBeReturned() {

    webTestClient
        .get()
        .uri(uriBuilder ->
            uriBuilder
                .path("/api/v1/entities_types")
                .queryParam("name_like", "{param1}")
                .build("Thi"))
        .exchange()
        .expectStatus().isOk()
        .expectBodyList(EntityType.class)
        .value(response -> {

              Collections.sort(response);

              Assertions.assertThat(response.get(0).getId()).isEqualTo(entityType3.getId());
              try {
                JSONAssert.assertEquals(entityType3.getData(), response.get(0).getData(), false);
              } catch (JSONException e) {
                throw new RuntimeException(e);
              }
              Assertions.assertThat(response.get(0).getVersion()).isEqualTo(1);


            }
        );
  }

  @Test
  public void Given_EntityTypeRecordsExist_When_GetAllWithoutFilters_Then_AllEntityTypeRecordsWillBeReturned() {

    webTestClient
        .get()
        .uri(uriBuilder ->
            uriBuilder
                .path("/api/v1/entities_types")
                .build())
        .exchange()
        .expectStatus().isOk()
        .expectBodyList(EntityType.class)
        .value(response -> {

              Collections.sort(response);

              Assertions.assertThat(response.get(0).getId()).isEqualTo(entityType1.getId());
              try {
                JSONAssert.assertEquals(entityType1.getData(), response.get(0).getData(), false);
              } catch (JSONException e) {
                throw new RuntimeException(e);
              }
              Assertions.assertThat(response.get(0).getVersion()).isEqualTo(entityType1.getVersion());

              Assertions.assertThat(response.get(1).getId()).isEqualTo(entityType2.getId());
              try {
                JSONAssert.assertEquals(entityType2.getData(), response.get(1).getData(), false);
              } catch (JSONException e) {
                throw new RuntimeException(e);
              }
              Assertions.assertThat(response.get(1).getVersion()).isEqualTo(entityType2.getVersion());

              Assertions.assertThat(response.get(2).getId()).isEqualTo(entityType3.getId());
              try {
                JSONAssert.assertEquals(entityType3.getData(), response.get(2).getData(), false);
              } catch (JSONException e) {
                throw new RuntimeException(e);
              }
              Assertions.assertThat(response.get(2).getVersion()).isEqualTo(entityType3.getVersion());


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

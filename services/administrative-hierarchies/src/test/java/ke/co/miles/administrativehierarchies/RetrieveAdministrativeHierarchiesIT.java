/*
 * Copyright (C) 2021 Second Mile
 *
 * This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0.
 * If a copy of the MPL was not distributed with this file,
 * You can obtain one at http://mozilla.org/MPL/2.0/.
 */
package ke.co.miles.administrativehierarchies;

import java.util.Collections;
import ke.co.miles.administrativehierarchies.models.AdministrativeHierarchy;
import ke.co.miles.administrativehierarchies.util.builders.AdministrativeHierarchyBuilder;
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
@ContextConfiguration(initializers = RetrieveAdministrativeHierarchiesIT.Initializer.class)
public class RetrieveAdministrativeHierarchiesIT {

  static final PostgreSQLContainer postgreSQLContainer;
  static final AdministrativeHierarchy administrativeHierarchy1;
  static final AdministrativeHierarchy administrativeHierarchy2;
  static final AdministrativeHierarchy administrativeHierarchy3;

  static {

    postgreSQLContainer =
        new PostgreSQLContainer("postgres:10.15")
            .withDatabaseName("test")
            .withUsername("postgres")
            .withPassword("postgres");

    postgreSQLContainer
        .withInitScript("init.sql")
        .start();

    administrativeHierarchy1 =
        new AdministrativeHierarchyBuilder()
            .id(1L)
            .data(
                "{\"type\": {\"id\": 1},\"commissioner\": {\"id\": null,\"name\": \"First Administrative Hierarchy Name\"},\"responsible\": {\"id\": 1,\"nameTwo\": \"First Administrative Hierarchy Name\"}}")
            .version(1)
            .build();

    administrativeHierarchy2 =
        new AdministrativeHierarchyBuilder()
            .id(2L)
            .data(
                "{\"type\": {\"id\": 2},\"commissioner\": {\"id\": null,\"name\": \"Second Administrative Hierarchy Name\"},\"responsible\": {\"id\": 1,\"nameTwo\": \"Second Administrative Hierarchy Name\"}}")
            .version(1)
            .build();

    administrativeHierarchy3 =
        new AdministrativeHierarchyBuilder()
            .id(3L)
            .data(
                "{\"type\": {\"id\": 3},\"commissioner\": {\"id\": null,\"name\": \"Third Administrative Hierarchy Name\"},\"responsible\": {\"id\": 1,\"nameTwo\": null}}")
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
  public void Given_AdministrativeHierarchyRecordsExist_When_GetAllWithNameFilter_Then_OnlyAdministrativeHierarchyRecordsWithTheSpecifiedNameWillBeReturned() {

    webTestClient
        .get()
        .uri(uriBuilder ->
            uriBuilder
                .path("/api/v1/administrative_hierarchies")
                .queryParam("commissioner.name", "{param1}")
                .build("Third Administrative Hierarchy Name"))
        .exchange()
        .expectStatus().isOk()
        .expectBodyList(AdministrativeHierarchy.class)
        .value(response -> {

              Collections.sort(response);

              Assertions.assertThat(response.get(0).getId()).isEqualTo(administrativeHierarchy3.getId());
              try {
                JSONAssert.assertEquals(administrativeHierarchy3.getData(), response.get(0).getData(), false);
              } catch (JSONException e) {
                throw new RuntimeException(e);
              }
              Assertions.assertThat(response.get(0).getVersion()).isEqualTo(1);


            }
        );
  }


  @Test
  public void Given_AdministrativeHierarchyRecordsExist_When_GetAllWithNameFragmentFilter_Then_OnlyAdministrativeHierarchyRecordsWithTheSpecifiedNameFragmentWillBeReturned() {

    webTestClient
        .get()
        .uri(uriBuilder ->
            uriBuilder
                .path("/api/v1/administrative_hierarchies")
                .queryParam("commissioner.name_like", "{param1}")
                .build("Thi"))
        .exchange()
        .expectStatus().isOk()
        .expectBodyList(AdministrativeHierarchy.class)
        .value(response -> {

              Collections.sort(response);

              Assertions.assertThat(response.get(0).getId()).isEqualTo(administrativeHierarchy3.getId());
              try {
                JSONAssert.assertEquals(administrativeHierarchy3.getData(), response.get(0).getData(), false);
              } catch (JSONException e) {
                throw new RuntimeException(e);
              }
              Assertions.assertThat(response.get(0).getVersion()).isEqualTo(1);


            }
        );
  }

  @Test
  public void Given_AdministrativeHierarchyRecordsExist_When_GetAllWithoutFilters_Then_AllAdministrativeHierarchyRecordsWillBeReturned() {

    webTestClient
        .get()
        .uri(uriBuilder ->
            uriBuilder
                .path("/api/v1/administrative_hierarchies")
                .build())
        .exchange()
        .expectStatus().isOk()
        .expectBodyList(AdministrativeHierarchy.class)
        .value(response -> {

              Collections.sort(response);

              Assertions.assertThat(response.get(0).getId()).isEqualTo(administrativeHierarchy1.getId());
              try {
                JSONAssert.assertEquals(administrativeHierarchy1.getData(), response.get(0).getData(), false);
              } catch (JSONException e) {
                throw new RuntimeException(e);
              }
              Assertions.assertThat(response.get(0).getVersion()).isEqualTo(administrativeHierarchy1.getVersion());

              Assertions.assertThat(response.get(1).getId()).isEqualTo(administrativeHierarchy2.getId());
              try {
                JSONAssert.assertEquals(administrativeHierarchy2.getData(), response.get(1).getData(), false);
              } catch (JSONException e) {
                throw new RuntimeException(e);
              }
              Assertions.assertThat(response.get(1).getVersion()).isEqualTo(administrativeHierarchy2.getVersion());

              Assertions.assertThat(response.get(2).getId()).isEqualTo(administrativeHierarchy3.getId());
              try {
                JSONAssert.assertEquals(administrativeHierarchy3.getData(), response.get(2).getData(), false);
              } catch (JSONException e) {
                throw new RuntimeException(e);
              }
              Assertions.assertThat(response.get(2).getVersion()).isEqualTo(administrativeHierarchy3.getVersion());


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

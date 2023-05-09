/*
 * Copyright (C) 2021 Second Mile
 *
 * This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0.
 * If a copy of the MPL was not distributed with this file,
 * You can obtain one at http://mozilla.org/MPL/2.0/.
 */
package ke.co.miles.administrativestructures;

import java.util.Collections;
import ke.co.miles.administrativestructures.models.AdministrativeStructure;
import ke.co.miles.administrativestructures.util.builders.AdministrativeStructureBuilder;
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
@ContextConfiguration(initializers = RetrieveAdministrativeStructuresIT.Initializer.class)
public class RetrieveAdministrativeStructuresIT {

  static final PostgreSQLContainer postgreSQLContainer;
  static final AdministrativeStructure administrativeStructure1;
  static final AdministrativeStructure administrativeStructure2;
  static final AdministrativeStructure administrativeStructure3;

  static {

    postgreSQLContainer =
        new PostgreSQLContainer("postgres:10.15")
            .withDatabaseName("test")
            .withUsername("postgres")
            .withPassword("postgres");

    postgreSQLContainer
        .withInitScript("init.sql")
        .start();

    administrativeStructure1 =
        new AdministrativeStructureBuilder()
            .id(1L)
            .data(
                "{\"hierarchy\": {\"id\": 1,\"name\": \"First Administrative Structure Name\"},\"commissioner\": {\"id\": null,\"name\": \" Commissioner First Administrative Structure Name\"},\"responsible\": {\"id\":null,\"name\": \"Responsible First Administrative Structure Name\"}}")
            .version(1)
            .build();

    administrativeStructure2 =
        new AdministrativeStructureBuilder()
            .id(2L)
            .data(
                "{\"hierarchy\": {\"id\": 1,\"name\": \"Second Administrative Structure Name\"},\"commissioner\": {\"id\": null,\"name\": \" Commissioner Second Administrative Structure Name\"},\"responsible\": {\"id\":null,\"name\": \"Responsible Second Administrative Structure Name\"}}")
            .version(1)
            .build();

    administrativeStructure3 =
        new AdministrativeStructureBuilder()
            .id(3L)
            .data(
                "{\"hierarchy\": {\"id\": 1,\"name\": \"Third Administrative Structure Name\"},\"commissioner\": {\"id\": null,\"name\": \" Commissioner Third Administrative Structure Name\"},\"responsible\": {\"id\":null,\"name\": \"Responsible Third Administrative Structure Name\"}}")
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
  public void Given_AdministrativeStructureRecordsExist_When_GetAllWithNameFilter_Then_OnlyAdministrativeStructureRecordsWithTheSpecifiedNameWillBeReturned() {

    webTestClient
        .get()
        .uri(uriBuilder ->
            uriBuilder
                .path("/api/v1/administrative_structures")
                .queryParam("hierarchy.name", "{param1}")
                .build("Third Administrative Structure Name"))
        .exchange()
        .expectStatus().isOk()
        .expectBodyList(AdministrativeStructure.class)
        .value(response -> {

              Collections.sort(response);

              Assertions.assertThat(response.get(0).getId()).isEqualTo(administrativeStructure3.getId());
              try {
                JSONAssert.assertEquals(administrativeStructure3.getData(), response.get(0).getData(), false);
              } catch (JSONException e) {
                throw new RuntimeException(e);
              }
              Assertions.assertThat(response.get(0).getVersion()).isEqualTo(1);


            }
        );
  }


  @Test
  public void Given_AdministrativeStructureRecordsExist_When_GetAllWithNameFragmentFilter_Then_OnlyAdministrativeStructureRecordsWithTheSpecifiedNameFragmentWillBeReturned() {

    webTestClient
        .get()
        .uri(uriBuilder ->
            uriBuilder
                .path("/api/v1/administrative_structures")
                .queryParam("hierarchy.name_like", "{param1}")
                .build("Thi"))
        .exchange()
        .expectStatus().isOk()
        .expectBodyList(AdministrativeStructure.class)
        .value(response -> {

              Collections.sort(response);

              Assertions.assertThat(response.get(0).getId()).isEqualTo(administrativeStructure3.getId());
              try {
                JSONAssert.assertEquals(administrativeStructure3.getData(), response.get(0).getData(), false);
              } catch (JSONException e) {
                throw new RuntimeException(e);
              }
              Assertions.assertThat(response.get(0).getVersion()).isEqualTo(1);


            }
        );
  }

  @Test
  public void Given_AdministrativeStructureRecordsExist_When_GetAllWithoutFilters_Then_AllAdministrativeStructureRecordsWillBeReturned() {

    webTestClient
        .get()
        .uri(uriBuilder ->
            uriBuilder
                .path("/api/v1/administrative_structures")
                .build())
        .exchange()
        .expectStatus().isOk()
        .expectBodyList(AdministrativeStructure.class)
        .value(response -> {

              Collections.sort(response);

              Assertions.assertThat(response.get(0).getId()).isEqualTo(administrativeStructure1.getId());
              try {
                JSONAssert.assertEquals(administrativeStructure1.getData(), response.get(0).getData(), false);
              } catch (JSONException e) {
                throw new RuntimeException(e);
              }
              Assertions.assertThat(response.get(0).getVersion()).isEqualTo(administrativeStructure1.getVersion());

              Assertions.assertThat(response.get(1).getId()).isEqualTo(administrativeStructure2.getId());
              try {
                JSONAssert.assertEquals(administrativeStructure2.getData(), response.get(1).getData(), false);
              } catch (JSONException e) {
                throw new RuntimeException(e);
              }
              Assertions.assertThat(response.get(1).getVersion()).isEqualTo(administrativeStructure2.getVersion());

              Assertions.assertThat(response.get(2).getId()).isEqualTo(administrativeStructure3.getId());
              try {
                JSONAssert.assertEquals(administrativeStructure3.getData(), response.get(2).getData(), false);
              } catch (JSONException e) {
                throw new RuntimeException(e);
              }
              Assertions.assertThat(response.get(2).getVersion()).isEqualTo(administrativeStructure3.getVersion());


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

/*
 * Copyright (C) 2021 Second Mile
 *
 * This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0.
 * If a copy of the MPL was not distributed with this file,
 * You can obtain one at http://mozilla.org/MPL/2.0/.
 */
package ke.co.miles.administrativesystems;

import java.util.Collections;
import ke.co.miles.administrativesystems.models.AdministrativeSystem;
import ke.co.miles.administrativesystems.util.builders.AdministrativeSystemBuilder;
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
@ContextConfiguration(initializers = RetrieveAdministrativeSystemsIT.Initializer.class)
public class RetrieveAdministrativeSystemsIT {

  static final PostgreSQLContainer postgreSQLContainer;
  static final AdministrativeSystem administrativeSystem1;
  static final AdministrativeSystem administrativeSystem2;
  static final AdministrativeSystem administrativeSystem3;

  static {

    postgreSQLContainer =
        new PostgreSQLContainer("postgres:10.15")
            .withDatabaseName("test")
            .withUsername("postgres")
            .withPassword("postgres");

    postgreSQLContainer
        .withInitScript("init.sql")
        .start();

    administrativeSystem1 =
        new AdministrativeSystemBuilder()
            .id(1L)
            .data(
                "{\"name\":\"First Administrative System Name\"}")
            .version(1)
            .build();

    administrativeSystem2 =
        new AdministrativeSystemBuilder()
            .id(2L)
            .data(
                "{\"name\":\"Second Administrative System Name\"}")
            .version(1)
            .build();

    administrativeSystem3 =
        new AdministrativeSystemBuilder()
            .id(3L)
            .data(
                "{\"name\":\"Third Administrative System Name\"}")
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
  public void Given_AdministrativeSystemRecordsExist_When_GetAllWithNameFilter_Then_OnlyAdministrativeSystemRecordsWithTheSpecifiedNameWillBeReturned() {

    webTestClient
        .get()
        .uri(uriBuilder ->
            uriBuilder
                .path("/api/v1/administrative_systems")
                .queryParam("name", "{param1}")
                .build("Third Administrative System Name"))
        .exchange()
        .expectStatus().isOk()
        .expectBodyList(AdministrativeSystem.class)
        .value(response -> {

              Collections.sort(response);

              Assertions.assertThat(response.get(0).getId()).isEqualTo(administrativeSystem3.getId());
              try {
                JSONAssert.assertEquals(administrativeSystem3.getData(), response.get(0).getData(), false);
              } catch (JSONException e) {
                throw new RuntimeException(e);
              }
              Assertions.assertThat(response.get(0).getVersion()).isEqualTo(1);


            }
        );
  }


  @Test
  public void Given_AdministrativeSystemRecordsExist_When_GetAllWithNameFragmentFilter_Then_OnlyAdministrativeSystemRecordsWithTheSpecifiedNameFragmentWillBeReturned() {

    webTestClient
        .get()
        .uri(uriBuilder ->
            uriBuilder
                .path("/api/v1/administrative_systems")
                .queryParam("name_like", "{param1}")
                .build("Thi"))
        .exchange()
        .expectStatus().isOk()
        .expectBodyList(AdministrativeSystem.class)
        .value(response -> {

              Collections.sort(response);

              Assertions.assertThat(response.get(0).getId()).isEqualTo(administrativeSystem3.getId());
              try {
                JSONAssert.assertEquals(administrativeSystem3.getData(), response.get(0).getData(), false);
              } catch (JSONException e) {
                throw new RuntimeException(e);
              }
              Assertions.assertThat(response.get(0).getVersion()).isEqualTo(1);


            }
        );
  }

  @Test
  public void Given_AdministrativeSystemRecordsExist_When_GetAllWithoutFilters_Then_AllAdministrativeSystemRecordsWillBeReturned() {

    webTestClient
        .get()
        .uri(uriBuilder ->
            uriBuilder
                .path("/api/v1/administrative_systems")
                .build())
        .exchange()
        .expectStatus().isOk()
        .expectBodyList(AdministrativeSystem.class)
        .value(response -> {

              Collections.sort(response);

              Assertions.assertThat(response.get(0).getId()).isEqualTo(administrativeSystem1.getId());
              try {
                JSONAssert.assertEquals(administrativeSystem1.getData(), response.get(0).getData(), false);
              } catch (JSONException e) {
                throw new RuntimeException(e);
              }
              Assertions.assertThat(response.get(0).getVersion()).isEqualTo(administrativeSystem1.getVersion());

              Assertions.assertThat(response.get(1).getId()).isEqualTo(administrativeSystem2.getId());
              try {
                JSONAssert.assertEquals(administrativeSystem2.getData(), response.get(1).getData(), false);
              } catch (JSONException e) {
                throw new RuntimeException(e);
              }
              Assertions.assertThat(response.get(1).getVersion()).isEqualTo(administrativeSystem2.getVersion());

              Assertions.assertThat(response.get(2).getId()).isEqualTo(administrativeSystem3.getId());
              try {
                JSONAssert.assertEquals(administrativeSystem3.getData(), response.get(2).getData(), false);
              } catch (JSONException e) {
                throw new RuntimeException(e);
              }
              Assertions.assertThat(response.get(2).getVersion()).isEqualTo(administrativeSystem3.getVersion());


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

/*
 * Copyright (C) 2021 Second Mile
 *
 * This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0.
 * If a copy of the MPL was not distributed with this file,
 * You can obtain one at http://mozilla.org/MPL/2.0/.
 */
package ke.co.miles.administrativeunits;

import java.util.Collections;
import ke.co.miles.administrativeunits.models.AdministrativeUnit;
import ke.co.miles.administrativeunits.util.builders.AdministrativeUnitBuilder;
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
@ContextConfiguration(initializers = RetrieveAdministrativeUnitsIT.Initializer.class)
public class RetrieveAdministrativeUnitsIT {

  static final PostgreSQLContainer postgreSQLContainer;
  static final AdministrativeUnit administrativeUnit1;
  static final AdministrativeUnit administrativeUnit2;
  static final AdministrativeUnit administrativeUnit3;

  static {

    postgreSQLContainer =
        new PostgreSQLContainer("postgres:10.15")
            .withDatabaseName("test")
            .withUsername("postgres")
            .withPassword("postgres");

    postgreSQLContainer
        .withInitScript("init.sql")
        .start();

    administrativeUnit1 =
        new AdministrativeUnitBuilder()
            .id(1L)
            .data(
                "{\"name\":\"First Administrative Unit Name\",\"typeId\":1}")
            .version(1)
            .build();

    administrativeUnit2 =
        new AdministrativeUnitBuilder()
            .id(2L)
            .data(
                "{\"name\":\"Second Administrative Unit Name\",\"typeId\":2}")
            .version(1)
            .build();

    administrativeUnit3 =
        new AdministrativeUnitBuilder()
            .id(3L)
            .data(
                "{\"name\":\"Third Administrative Unit Name\",\"typeId\":3}")
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
  public void Given_AdministrativeUnitRecordsExist_When_GetAllWithNameFilter_Then_OnlyAdministrativeUnitRecordsWithTheSpecifiedNameWillBeReturned() {

    webTestClient
        .get()
        .uri(uriBuilder ->
            uriBuilder
                .path("/api/v1/administrative_units")
                .queryParam("name", "{param1}")
                .build("Third Administrative Unit Name"))
        .exchange()
        .expectStatus().isOk()
        .expectBodyList(AdministrativeUnit.class)
        .value(response -> {

              Collections.sort(response);

              Assertions.assertThat(response.get(0).getId()).isEqualTo(administrativeUnit3.getId());
              try {
                JSONAssert.assertEquals(administrativeUnit3.getData(), response.get(0).getData(), false);
              } catch (JSONException e) {
                throw new RuntimeException(e);
              }
              Assertions.assertThat(response.get(0).getVersion()).isEqualTo(1);


            }
        );
  }


  @Test
  public void Given_AdministrativeUnitRecordsExist_When_GetAllWithNameFragmentFilter_Then_OnlyAdministrativeUnitRecordsWithTheSpecifiedNameFragmentWillBeReturned() {

    webTestClient
        .get()
        .uri(uriBuilder ->
            uriBuilder
                .path("/api/v1/administrative_units")
                .queryParam("name_like", "{param1}")
                .build("Thi"))
        .exchange()
        .expectStatus().isOk()
        .expectBodyList(AdministrativeUnit.class)
        .value(response -> {

              Collections.sort(response);

              Assertions.assertThat(response.get(0).getId()).isEqualTo(administrativeUnit3.getId());
              try {
                JSONAssert.assertEquals(administrativeUnit3.getData(), response.get(0).getData(), false);
              } catch (JSONException e) {
                throw new RuntimeException(e);
              }
              Assertions.assertThat(response.get(0).getVersion()).isEqualTo(1);


            }
        );
  }

  @Test
  public void Given_AdministrativeUnitRecordsExist_When_GetAllWithoutFilters_Then_AllAdministrativeUnitRecordsWillBeReturned() {

    webTestClient
        .get()
        .uri(uriBuilder ->
            uriBuilder
                .path("/api/v1/administrative_units")
                .build())
        .exchange()
        .expectStatus().isOk()
        .expectBodyList(AdministrativeUnit.class)
        .value(response -> {

              Collections.sort(response);

              Assertions.assertThat(response.get(0).getId()).isEqualTo(administrativeUnit1.getId());
              try {
                JSONAssert.assertEquals(administrativeUnit1.getData(), response.get(0).getData(), false);
              } catch (JSONException e) {
                throw new RuntimeException(e);
              }
              Assertions.assertThat(response.get(0).getVersion()).isEqualTo(administrativeUnit1.getVersion());

              Assertions.assertThat(response.get(1).getId()).isEqualTo(administrativeUnit2.getId());
              try {
                JSONAssert.assertEquals(administrativeUnit2.getData(), response.get(1).getData(), false);
              } catch (JSONException e) {
                throw new RuntimeException(e);
              }
              Assertions.assertThat(response.get(1).getVersion()).isEqualTo(administrativeUnit2.getVersion());

              Assertions.assertThat(response.get(2).getId()).isEqualTo(administrativeUnit3.getId());
              try {
                JSONAssert.assertEquals(administrativeUnit3.getData(), response.get(2).getData(), false);
              } catch (JSONException e) {
                throw new RuntimeException(e);
              }
              Assertions.assertThat(response.get(2).getVersion()).isEqualTo(administrativeUnit3.getVersion());


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

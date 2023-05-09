/*
 * Copyright (C) 2021 Second Mile
 *
 * This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0.
 * If a copy of the MPL was not distributed with this file,
 * You can obtain one at http://mozilla.org/MPL/2.0/.
 */
package ke.co.miles.administrativeunitstypes;

import java.util.Collections;
import ke.co.miles.administrativeunitstypes.models.AdministrativeUnitType;
import ke.co.miles.administrativeunitstypes.util.builders.AdministrativeUnitTypeBuilder;
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
@ContextConfiguration(initializers = RetrieveAdministrativeUnitsTypesIT.Initializer.class)
public class RetrieveAdministrativeUnitsTypesIT {

  static final PostgreSQLContainer postgreSQLContainer;
  static final AdministrativeUnitType administrativeUnitType1;
  static final AdministrativeUnitType administrativeUnitType2;
  static final AdministrativeUnitType administrativeUnitType3;

  static {

    postgreSQLContainer =
        new PostgreSQLContainer("postgres:10.15")
            .withDatabaseName("test")
            .withUsername("postgres")
            .withPassword("postgres");

    postgreSQLContainer
        .withInitScript("init.sql")
        .start();

    administrativeUnitType1 =
        new AdministrativeUnitTypeBuilder()
            .id(1L)
            .data(
                "{\"name\":\"First Administrative Unit Type Name\",\"plural\":\"First Administrative Unit Type Plural\"}")
            .version(1)
            .build();

    administrativeUnitType2 =
        new AdministrativeUnitTypeBuilder()
            .id(2L)
            .data(
                "{\"name\":\"Second Administrative Unit Type Name\",\"plural\":\"Second Administrative Unit Type Plural\"}")
            .version(1)
            .build();

    administrativeUnitType3 =
        new AdministrativeUnitTypeBuilder()
            .id(3L)
            .data(
                "{\"name\":\"Third Administrative Unit Type Name\",\"plural\":\"Third Administrative Unit Type Plural\"}")
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
  public void Given_AdministrativeUnitTypeRecordsExist_When_GetAllWithNameFilter_Then_OnlyAdministrativeUnitTypeRecordsWithTheSpecifiedNameWillBeReturned() {

    webTestClient
        .get()
        .uri(uriBuilder ->
            uriBuilder
                .path("/api/v1/administrative_units_types")
                .queryParam("name", "{param1}")
                .build("Third Administrative Unit Type Name"))
        .exchange()
        .expectStatus().isOk()
        .expectBodyList(AdministrativeUnitType.class)
        .value(response -> {

              Collections.sort(response);

              Assertions.assertThat(response.get(0).getId()).isEqualTo(administrativeUnitType3.getId());
              try {
                JSONAssert.assertEquals(administrativeUnitType3.getData(), response.get(0).getData(), false);
              } catch (JSONException e) {
                throw new RuntimeException(e);
              }
              Assertions.assertThat(response.get(0).getVersion()).isEqualTo(1);


            }
        );
  }


  @Test
  public void Given_AdministrativeUnitTypeRecordsExist_When_GetAllWithNameFragmentFilter_Then_OnlyAdministrativeUnitTypeRecordsWithTheSpecifiedNameFragmentWillBeReturned() {

    webTestClient
        .get()
        .uri(uriBuilder ->
            uriBuilder
                .path("/api/v1/administrative_units_types")
                .queryParam("name_like", "{param1}")
                .build("Thi"))
        .exchange()
        .expectStatus().isOk()
        .expectBodyList(AdministrativeUnitType.class)
        .value(response -> {

              Collections.sort(response);

              Assertions.assertThat(response.get(0).getId()).isEqualTo(administrativeUnitType3.getId());
              try {
                JSONAssert.assertEquals(administrativeUnitType3.getData(), response.get(0).getData(), false);
              } catch (JSONException e) {
                throw new RuntimeException(e);
              }
              Assertions.assertThat(response.get(0).getVersion()).isEqualTo(1);


            }
        );
  }

  @Test
  public void Given_AdministrativeUnitTypeRecordsExist_When_GetAllWithoutFilters_Then_AllAdministrativeUnitTypeRecordsWillBeReturned() {

    webTestClient
        .get()
        .uri(uriBuilder ->
            uriBuilder
                .path("/api/v1/administrative_units_types")
                .build())
        .exchange()
        .expectStatus().isOk()
        .expectBodyList(AdministrativeUnitType.class)
        .value(response -> {

              Collections.sort(response);

              Assertions.assertThat(response.get(0).getId()).isEqualTo(administrativeUnitType1.getId());
              try {
                JSONAssert.assertEquals(administrativeUnitType1.getData(), response.get(0).getData(), false);
              } catch (JSONException e) {
                throw new RuntimeException(e);
              }
              Assertions.assertThat(response.get(0).getVersion()).isEqualTo(administrativeUnitType1.getVersion());

              Assertions.assertThat(response.get(1).getId()).isEqualTo(administrativeUnitType2.getId());
              try {
                JSONAssert.assertEquals(administrativeUnitType2.getData(), response.get(1).getData(), false);
              } catch (JSONException e) {
                throw new RuntimeException(e);
              }
              Assertions.assertThat(response.get(1).getVersion()).isEqualTo(administrativeUnitType2.getVersion());

              Assertions.assertThat(response.get(2).getId()).isEqualTo(administrativeUnitType3.getId());
              try {
                JSONAssert.assertEquals(administrativeUnitType3.getData(), response.get(2).getData(), false);
              } catch (JSONException e) {
                throw new RuntimeException(e);
              }
              Assertions.assertThat(response.get(2).getVersion()).isEqualTo(administrativeUnitType3.getVersion());


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

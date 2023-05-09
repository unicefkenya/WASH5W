/*
 * Copyright (C) 2021 Second Mile
 *
 * This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0.
 * If a copy of the MPL was not distributed with this file,
 * You can obtain one at http://mozilla.org/MPL/2.0/.
 */
package ke.co.miles.indicators;

import java.util.Collections;
import ke.co.miles.indicators.models.Indicator;
import ke.co.miles.indicators.util.builders.IndicatorBuilder;
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
@ContextConfiguration(initializers = RetrieveIndicatorsIT.Initializer.class)
public class RetrieveIndicatorsIT {

  static final PostgreSQLContainer postgreSQLContainer;
  static final Indicator indicator1;
  static final Indicator indicator2;
  static final Indicator indicator3;

  static {

    postgreSQLContainer =
        new PostgreSQLContainer("postgres:10.15")
            .withDatabaseName("test")
            .withUsername("postgres")
            .withPassword("postgres");

    postgreSQLContainer
        .withInitScript("init.sql")
        .start();

    indicator1 =
        new IndicatorBuilder()
            .id(1L)
            .data(
                    "{\"contextId\": 1,\"logicalParentId\": 1,\"unitId\": 5,\"no\": null,\"name\": \"First Indicator Name\",\"subindicatorsFilled\": false,\"subindicatorsIds\": [],\"formFilled\": false,\"formFieldId\": null,\"fillingRule\": null}")
            .version(1)
            .build();

    indicator2 =
        new IndicatorBuilder()
            .id(2L)
            .data(
                    "{\"contextId\": 1,\"logicalParentId\": 1,\"unitId\": 5,\"no\": null,\"name\": \"Second Indicator Name\",\"subindicatorsFilled\": false,\"subindicatorsIds\": [],\"formFilled\": false,\"formFieldId\": null,\"fillingRule\": null}")
            .version(1)
            .build();

    indicator3 =
        new IndicatorBuilder()
            .id(3L)
            .data(
                    "{\"contextId\": 1,\"logicalParentId\": 1,\"unitId\": 5,\"no\": null,\"name\": \"Third Indicator Name\",\"subindicatorsFilled\": false,\"subindicatorsIds\": [],\"formFilled\": false,\"formFieldId\": null,\"fillingRule\": null}")
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
  public void Given_IndicatorRecordsExist_When_GetAllWithNameFilter_Then_OnlyIndicatorRecordsWithTheSpecifiedNameWillBeReturned() {

    webTestClient
        .get()
        .uri(uriBuilder ->
            uriBuilder
                .path("/api/v1/indicators")
                .queryParam("name", "{param1}")
                .build("Third Indicator Name"))
        .exchange()
        .expectStatus().isOk()
        .expectBodyList(Indicator.class)
        .value(response -> {

              Collections.sort(response);

              Assertions.assertThat(response.get(0).getId()).isEqualTo(indicator3.getId());
              try {
                JSONAssert.assertEquals(indicator3.getData(), response.get(0).getData(), false);
              } catch (JSONException e) {
                throw new RuntimeException(e);
              }
              Assertions.assertThat(response.get(0).getVersion()).isEqualTo(1);


            }
        );
  }


  @Test
  public void Given_IndicatorRecordsExist_When_GetAllWithNameFragmentFilter_Then_OnlyIndicatorRecordsWithTheSpecifiedNameFragmentWillBeReturned() {

    webTestClient
        .get()
        .uri(uriBuilder ->
            uriBuilder
                .path("/api/v1/indicators")
                .queryParam("name_like", "{param1}")
                .build("T"))
        .exchange()
        .expectStatus().isOk()
        .expectBodyList(Indicator.class)
        .value(response -> {

              Collections.sort(response);

              Assertions.assertThat(response.get(0).getId()).isEqualTo(indicator3.getId());
              try {
                JSONAssert.assertEquals(indicator3.getData(), response.get(0).getData(), false);
              } catch (JSONException e) {
                throw new RuntimeException(e);
              }
              Assertions.assertThat(response.get(0).getVersion()).isEqualTo(1);


            }
        );
  }


  @Test
  public void Given_IndicatorRecordsExist_When_GetAllWithoutFilters_Then_AllIndicatorRecordsWillBeReturned() {

    webTestClient
        .get()
        .uri(uriBuilder ->
            uriBuilder
                .path("/api/v1/indicators")
                .build())
        .exchange()
        .expectStatus().isOk()
        .expectBodyList(Indicator.class)
        .value(response -> {

              Collections.sort(response);

              Assertions.assertThat(response.get(0).getId()).isEqualTo(indicator1.getId());
              try {
                JSONAssert.assertEquals(indicator1.getData(), response.get(0).getData(), false);
              } catch (JSONException e) {
                throw new RuntimeException(e);
              }
              Assertions.assertThat(response.get(0).getVersion()).isEqualTo(indicator1.getVersion());

              Assertions.assertThat(response.get(1).getId()).isEqualTo(indicator2.getId());
              try {
                JSONAssert.assertEquals(indicator2.getData(), response.get(1).getData(), false);
              } catch (JSONException e) {
                throw new RuntimeException(e);
              }
              Assertions.assertThat(response.get(1).getVersion()).isEqualTo(indicator2.getVersion());

              Assertions.assertThat(response.get(2).getId()).isEqualTo(indicator3.getId());
              try {
                JSONAssert.assertEquals(indicator3.getData(), response.get(2).getData(), false);
              } catch (JSONException e) {
                throw new RuntimeException(e);
              }
              Assertions.assertThat(response.get(2).getVersion()).isEqualTo(indicator3.getVersion());


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

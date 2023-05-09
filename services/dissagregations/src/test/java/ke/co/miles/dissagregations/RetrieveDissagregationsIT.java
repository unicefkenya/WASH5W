/*
 * Copyright (C) 2021 Second Mile
 *
 * This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0.
 * If a copy of the MPL was not distributed with this file,
 * You can obtain one at http://mozilla.org/MPL/2.0/.
 */
package ke.co.miles.dissagregations;

import java.util.Collections;
import ke.co.miles.dissagregations.models.Dissagregation;
import ke.co.miles.dissagregations.util.builders.DissagregationBuilder;
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
@ContextConfiguration(initializers = RetrieveDissagregationsIT.Initializer.class)
public class RetrieveDissagregationsIT {

  static final PostgreSQLContainer postgreSQLContainer;
  static final Dissagregation dissagregation1;
  static final Dissagregation dissagregation2;
  static final Dissagregation dissagregation3;

  static {

    postgreSQLContainer =
        new PostgreSQLContainer("postgres:10.15")
            .withDatabaseName("test")
            .withUsername("postgres")
            .withPassword("postgres");

    postgreSQLContainer
        .withInitScript("init.sql")
        .start();

    dissagregation1 =
        new DissagregationBuilder()
            .id(1L)
            .data(
                    "{\"schemeId\": 1,\"name\": \"First Dissagregation Name\",\"abbreviation\": \"F\"}")
            .version(1)
            .build();

    dissagregation2 =
        new DissagregationBuilder()
            .id(2L)
            .data(
                    "{\"schemeId\": 1,\"name\": \"Second Dissagregation Name\",\"abbreviation\": \"S\"}")
            .version(1)
            .build();

    dissagregation3 =
        new DissagregationBuilder()
            .id(3L)
            .data(
                    "{\"schemeId\": 1,\"name\": \"Third Dissagregation Name\",\"abbreviation\": \"T\"}")
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
  public void Given_DissagregationRecordsExist_When_GetAllWithNameFilter_Then_OnlyDissagregationRecordsWithTheSpecifiedNameWillBeReturned() {

    webTestClient
        .get()
        .uri(uriBuilder ->
            uriBuilder
                .path("/api/v1/dissagregations")
                .queryParam("name", "{param1}")
                .build("Third Dissagregation Name"))
        .exchange()
        .expectStatus().isOk()
        .expectBodyList(Dissagregation.class)
        .value(response -> {

              Collections.sort(response);

              Assertions.assertThat(response.get(0).getId()).isEqualTo(dissagregation3.getId());
              try {
                JSONAssert.assertEquals(dissagregation3.getData(), response.get(0).getData(), false);
              } catch (JSONException e) {
                throw new RuntimeException(e);
              }
              Assertions.assertThat(response.get(0).getVersion()).isEqualTo(1);


            }
        );
  }


  @Test
  public void Given_DissagregationRecordsExist_When_GetAllWithNameFragmentFilter_Then_OnlyDissagregationRecordsWithTheSpecifiedNameFragmentWillBeReturned() {

    webTestClient
        .get()
        .uri(uriBuilder ->
            uriBuilder
                .path("/api/v1/dissagregations")
                .queryParam("name_like", "{param1}")
                .build("T"))
        .exchange()
        .expectStatus().isOk()
        .expectBodyList(Dissagregation.class)
        .value(response -> {

              Collections.sort(response);

              Assertions.assertThat(response.get(0).getId()).isEqualTo(dissagregation3.getId());
              try {
                JSONAssert.assertEquals(dissagregation3.getData(), response.get(0).getData(), false);
              } catch (JSONException e) {
                throw new RuntimeException(e);
              }
              Assertions.assertThat(response.get(0).getVersion()).isEqualTo(1);


            }
        );
  }


  @Test
  public void Given_DissagregationRecordsExist_When_GetAllWithoutFilters_Then_AllDissagregationRecordsWillBeReturned() {

    webTestClient
        .get()
        .uri(uriBuilder ->
            uriBuilder
                .path("/api/v1/dissagregations")
                .build())
        .exchange()
        .expectStatus().isOk()
        .expectBodyList(Dissagregation.class)
        .value(response -> {

              Collections.sort(response);

              Assertions.assertThat(response.get(0).getId()).isEqualTo(dissagregation1.getId());
              try {
                JSONAssert.assertEquals(dissagregation1.getData(), response.get(0).getData(), false);
              } catch (JSONException e) {
                throw new RuntimeException(e);
              }
              Assertions.assertThat(response.get(0).getVersion()).isEqualTo(dissagregation1.getVersion());

              Assertions.assertThat(response.get(1).getId()).isEqualTo(dissagregation2.getId());
              try {
                JSONAssert.assertEquals(dissagregation2.getData(), response.get(1).getData(), false);
              } catch (JSONException e) {
                throw new RuntimeException(e);
              }
              Assertions.assertThat(response.get(1).getVersion()).isEqualTo(dissagregation2.getVersion());

              Assertions.assertThat(response.get(2).getId()).isEqualTo(dissagregation3.getId());
              try {
                JSONAssert.assertEquals(dissagregation3.getData(), response.get(2).getData(), false);
              } catch (JSONException e) {
                throw new RuntimeException(e);
              }
              Assertions.assertThat(response.get(2).getVersion()).isEqualTo(dissagregation3.getVersion());


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

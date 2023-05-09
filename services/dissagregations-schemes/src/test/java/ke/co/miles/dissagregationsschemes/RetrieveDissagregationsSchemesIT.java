/*
 * Copyright (C) 2021 Second Mile
 *
 * This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0.
 * If a copy of the MPL was not distributed with this file,
 * You can obtain one at http://mozilla.org/MPL/2.0/.
 */
package ke.co.miles.dissagregationsschemes;

import java.util.Collections;
import ke.co.miles.dissagregationsschemes.models.DissagregationScheme;
import ke.co.miles.dissagregationsschemes.util.builders.DissagregationSchemeBuilder;
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
@ContextConfiguration(initializers = RetrieveDissagregationsSchemesIT.Initializer.class)
public class RetrieveDissagregationsSchemesIT {

  static final PostgreSQLContainer postgreSQLContainer;
  static final DissagregationScheme dissagregationScheme1;
  static final DissagregationScheme dissagregationScheme2;
  static final DissagregationScheme dissagregationScheme3;

  static {

    postgreSQLContainer =
        new PostgreSQLContainer("postgres:10.15")
            .withDatabaseName("test")
            .withUsername("postgres")
            .withPassword("postgres");

    postgreSQLContainer
        .withInitScript("init.sql")
        .start();

    dissagregationScheme1 =
        new DissagregationSchemeBuilder()
            .id(1L)
            .data(
                "{\"name\":\"First Dissagregation Scheme Name\"}")
            .version(1)
            .build();

    dissagregationScheme2 =
        new DissagregationSchemeBuilder()
            .id(2L)
            .data(
                "{\"name\":\"Second Dissagregation Scheme Name\"}")
            .version(1)
            .build();

    dissagregationScheme3 =
        new DissagregationSchemeBuilder()
            .id(3L)
            .data(
                "{\"name\":\"Third Dissagregation Scheme Name\"}")
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
  public void Given_DissagregationSchemeRecordsExist_When_GetAllWithNameFilter_Then_OnlyDissagregationSchemeRecordsWithTheSpecifiedNameWillBeReturned() {

    webTestClient
        .get()
        .uri(uriBuilder ->
            uriBuilder
                .path("/api/v1/dissagregations_schemes")
                .queryParam("name", "{param1}")
                .build("Third Dissagregation Scheme Name"))
        .exchange()
        .expectStatus().isOk()
        .expectBodyList(DissagregationScheme.class)
        .value(response -> {

              Collections.sort(response);

              Assertions.assertThat(response.get(0).getId()).isEqualTo(dissagregationScheme3.getId());
              try {
                JSONAssert.assertEquals(dissagregationScheme3.getData(), response.get(0).getData(), false);
              } catch (JSONException e) {
                throw new RuntimeException(e);
              }
              Assertions.assertThat(response.get(0).getVersion()).isEqualTo(1);


            }
        );
  }


  @Test
  public void Given_DissagregationSchemeRecordsExist_When_GetAllWithNameFragmentFilter_Then_OnlyDissagregationSchemeRecordsWithTheSpecifiedNameFragmentWillBeReturned() {

    webTestClient
        .get()
        .uri(uriBuilder ->
            uriBuilder
                .path("/api/v1/dissagregations_schemes")
                .queryParam("name_like", "{param1}")
                .build("Thi"))
        .exchange()
        .expectStatus().isOk()
        .expectBodyList(DissagregationScheme.class)
        .value(response -> {

              Collections.sort(response);

              Assertions.assertThat(response.get(0).getId()).isEqualTo(dissagregationScheme3.getId());
              try {
                JSONAssert.assertEquals(dissagregationScheme3.getData(), response.get(0).getData(), false);
              } catch (JSONException e) {
                throw new RuntimeException(e);
              }
              Assertions.assertThat(response.get(0).getVersion()).isEqualTo(1);


            }
        );
  }

  @Test
  public void Given_DissagregationSchemeRecordsExist_When_GetAllWithoutFilters_Then_AllDissagregationSchemeRecordsWillBeReturned() {

    webTestClient
        .get()
        .uri(uriBuilder ->
            uriBuilder
                .path("/api/v1/dissagregations_schemes")
                .build())
        .exchange()
        .expectStatus().isOk()
        .expectBodyList(DissagregationScheme.class)
        .value(response -> {

              Collections.sort(response);

              Assertions.assertThat(response.get(0).getId()).isEqualTo(dissagregationScheme1.getId());
              try {
                JSONAssert.assertEquals(dissagregationScheme1.getData(), response.get(0).getData(), false);
              } catch (JSONException e) {
                throw new RuntimeException(e);
              }
              Assertions.assertThat(response.get(0).getVersion()).isEqualTo(dissagregationScheme1.getVersion());

              Assertions.assertThat(response.get(1).getId()).isEqualTo(dissagregationScheme2.getId());
              try {
                JSONAssert.assertEquals(dissagregationScheme2.getData(), response.get(1).getData(), false);
              } catch (JSONException e) {
                throw new RuntimeException(e);
              }
              Assertions.assertThat(response.get(1).getVersion()).isEqualTo(dissagregationScheme2.getVersion());

              Assertions.assertThat(response.get(2).getId()).isEqualTo(dissagregationScheme3.getId());
              try {
                JSONAssert.assertEquals(dissagregationScheme3.getData(), response.get(2).getData(), false);
              } catch (JSONException e) {
                throw new RuntimeException(e);
              }
              Assertions.assertThat(response.get(2).getVersion()).isEqualTo(dissagregationScheme3.getVersion());


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

/*
 * Copyright (C) 2021 Second Mile
 *
 * This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0.
 * If a copy of the MPL was not distributed with this file,
 * You can obtain one at http://mozilla.org/MPL/2.0/.
 */
package ke.co.miles.logicalschemes;

import java.util.Collections;
import ke.co.miles.logicalschemes.models.LogicalScheme;
import ke.co.miles.logicalschemes.util.builders.LogicalSchemeBuilder;
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
@ContextConfiguration(initializers = RetrieveLogicalSchemesIT.Initializer.class)
public class RetrieveLogicalSchemesIT {

  static final PostgreSQLContainer postgreSQLContainer;
  static final LogicalScheme logicalScheme1;
  static final LogicalScheme logicalScheme2;
  static final LogicalScheme logicalScheme3;

  static {

    postgreSQLContainer =
        new PostgreSQLContainer("postgres:10.15")
            .withDatabaseName("test")
            .withUsername("postgres")
            .withPassword("postgres");

    postgreSQLContainer
        .withInitScript("init.sql")
        .start();

    logicalScheme1 =
        new LogicalSchemeBuilder()
            .id(1L)
            .data("{\"name\":\"First Logical Scheme Name\"}")
            .version(1)
            .build();

    logicalScheme2 =
        new LogicalSchemeBuilder()
            .id(2L)
            .data("{\"name\":\"Second Logical Scheme Name\"}")
            .version(1)
            .build();

    logicalScheme3 =
        new LogicalSchemeBuilder()
            .id(3L)
            .data("{\"name\":\"Third Logical Scheme Name\"}")
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
  public void Given_LogicalSchemeRecordsExist_When_GetAllWithNameFilter_Then_OnlyLogicalSchemeRecordsWithTheSpecifiedNameWillBeReturned() {

    webTestClient
        .get()
        .uri(uriBuilder ->
            uriBuilder
                .path("/api/v1/logical_schemes")
                .queryParam("name", "{param1}")
                .build("Third Logical Scheme Name"))
        .exchange()
        .expectStatus().isOk()
        .expectBodyList(LogicalScheme.class)
        .value(response -> {

              Collections.sort(response);

              Assertions.assertThat(response.get(0).getId()).isEqualTo(logicalScheme3.getId());
              try {
                JSONAssert.assertEquals(logicalScheme3.getData(), response.get(0).getData(), false);
              } catch (JSONException e) {
                throw new RuntimeException(e);
              }
              Assertions.assertThat(response.get(0).getVersion()).isEqualTo(1);


            }
        );
  }


  @Test
  public void Given_LogicalSchemeRecordsExist_When_GetAllWithNameFragmentFilter_Then_OnlyLogicalSchemeRecordsWithTheSpecifiedNameFragmentWillBeReturned() {

    webTestClient
        .get()
        .uri(uriBuilder ->
            uriBuilder
                .path("/api/v1/logical_schemes")
                .queryParam("name_like", "{param1}")
                .build("Thi"))
        .exchange()
        .expectStatus().isOk()
        .expectBodyList(LogicalScheme.class)
        .value(response -> {

              Collections.sort(response);

              Assertions.assertThat(response.get(0).getId()).isEqualTo(logicalScheme3.getId());
              try {
                JSONAssert.assertEquals(logicalScheme3.getData(), response.get(0).getData(), false);
              } catch (JSONException e) {
                throw new RuntimeException(e);
              }
              Assertions.assertThat(response.get(0).getVersion()).isEqualTo(1);


            }
        );
  }


  @Test
  public void Given_LogicalSchemeRecordsExist_When_GetAllWithoutFilters_Then_AllLogicalSchemeRecordsWillBeReturned() {

    webTestClient
        .get()
        .uri(uriBuilder ->
            uriBuilder
                .path("/api/v1/logical_schemes")
                .build())
        .exchange()
        .expectStatus().isOk()
        .expectBodyList(LogicalScheme.class)
        .value(response -> {

              Collections.sort(response);

              Assertions.assertThat(response.get(0).getId()).isEqualTo(logicalScheme1.getId());
              try {
                JSONAssert.assertEquals(logicalScheme1.getData(), response.get(0).getData(), false);
              } catch (JSONException e) {
                throw new RuntimeException(e);
              }
              Assertions.assertThat(response.get(0).getVersion()).isEqualTo(logicalScheme1.getVersion());

              Assertions.assertThat(response.get(1).getId()).isEqualTo(logicalScheme2.getId());
              try {
                JSONAssert.assertEquals(logicalScheme2.getData(), response.get(1).getData(), false);
              } catch (JSONException e) {
                throw new RuntimeException(e);
              }
              Assertions.assertThat(response.get(1).getVersion()).isEqualTo(logicalScheme2.getVersion());

              Assertions.assertThat(response.get(2).getId()).isEqualTo(logicalScheme3.getId());
              try {
                JSONAssert.assertEquals(logicalScheme3.getData(), response.get(2).getData(), false);
              } catch (JSONException e) {
                throw new RuntimeException(e);
              }
              Assertions.assertThat(response.get(2).getVersion()).isEqualTo(logicalScheme3.getVersion());


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

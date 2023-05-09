/*
 * Copyright (C) 2021 Second Mile
 *
 * This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0.
 * If a copy of the MPL was not distributed with this file,
 * You can obtain one at http://mozilla.org/MPL/2.0/.
 */
package ke.co.miles.logicalelementstypes;

import java.util.Collections;
import ke.co.miles.logicalelementstypes.models.LogicalElementType;
import ke.co.miles.logicalelementstypes.util.builders.LogicalElementTypeBuilder;
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
@ContextConfiguration(initializers = RetrieveLogicalElementsTypesIT.Initializer.class)
public class RetrieveLogicalElementsTypesIT {

  static final PostgreSQLContainer postgreSQLContainer;
  static final LogicalElementType logicalElementType1;
  static final LogicalElementType logicalElementType2;
  static final LogicalElementType logicalElementType3;

  static {

    postgreSQLContainer =
        new PostgreSQLContainer("postgres:10.15")
            .withDatabaseName("test")
            .withUsername("postgres")
            .withPassword("postgres");

    postgreSQLContainer
        .withInitScript("init.sql")
        .start();

    logicalElementType1 =
        new LogicalElementTypeBuilder()
            .id(1L)
            .data("{\"name\":\"First Logical Element Type Name\",\"plural\":\"First Logical Element Type Names\"}")
            .version(1)
            .build();

    logicalElementType2 =
        new LogicalElementTypeBuilder()
            .id(2L)
            .data("{\"name\":\"Second Logical Element Type Name\",\"plural\":\"Second Logical Element Type Names\"}")
            .version(1)
            .build();

    logicalElementType3 =
        new LogicalElementTypeBuilder()
            .id(3L)
            .data("{\"name\":\"Third Logical Element Type Name\",\"plural\":\"Third Logical Element Type Names\"}")
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
  public void Given_LogicalElementTypeRecordsExist_When_GetAllWithNameFilter_Then_OnlyLogicalElementTypeRecordsWithTheSpecifiedNameWillBeReturned() {

    webTestClient
        .get()
        .uri(uriBuilder ->
            uriBuilder
                .path("/api/v1/logical_elements_types")
                .queryParam("name", "{param1}")
                .build("Third Logical Element Type Name"))
        .exchange()
        .expectStatus().isOk()
        .expectBodyList(LogicalElementType.class)
        .value(response -> {

              Collections.sort(response);

              Assertions.assertThat(response.get(0).getId()).isEqualTo(logicalElementType3.getId());
              try {
                JSONAssert.assertEquals(logicalElementType3.getData(), response.get(0).getData(), false);
              } catch (JSONException e) {
                throw new RuntimeException(e);
              }
              Assertions.assertThat(response.get(0).getVersion()).isEqualTo(1);


            }
        );
  }


  @Test
  public void Given_LogicalElementTypeRecordsExist_When_GetAllWithNameFragmentFilter_Then_OnlyLogicalElementTypeRecordsWithTheSpecifiedNameFragmentWillBeReturned() {

    webTestClient
        .get()
        .uri(uriBuilder ->
            uriBuilder
                .path("/api/v1/logical_elements_types")
                .queryParam("name_like", "{param1}")
                .build("Thi"))
        .exchange()
        .expectStatus().isOk()
        .expectBodyList(LogicalElementType.class)
        .value(response -> {

              Collections.sort(response);

              Assertions.assertThat(response.get(0).getId()).isEqualTo(logicalElementType3.getId());
              try {
                JSONAssert.assertEquals(logicalElementType3.getData(), response.get(0).getData(), false);
              } catch (JSONException e) {
                throw new RuntimeException(e);
              }
              Assertions.assertThat(response.get(0).getVersion()).isEqualTo(1);


            }
        );
  }


  @Test
  public void Given_LogicalElementTypeRecordsExist_When_GetAllWithoutFilters_Then_AllLogicalElementTypeRecordsWillBeReturned() {

    webTestClient
        .get()
        .uri(uriBuilder ->
            uriBuilder
                .path("/api/v1/logical_elements_types")
                .build())
        .exchange()
        .expectStatus().isOk()
        .expectBodyList(LogicalElementType.class)
        .value(response -> {

              Collections.sort(response);

              Assertions.assertThat(response.get(0).getId()).isEqualTo(logicalElementType1.getId());
              try {
                JSONAssert.assertEquals(logicalElementType1.getData(), response.get(0).getData(), false);
              } catch (JSONException e) {
                throw new RuntimeException(e);
              }
              Assertions.assertThat(response.get(0).getVersion()).isEqualTo(logicalElementType1.getVersion());

              Assertions.assertThat(response.get(1).getId()).isEqualTo(logicalElementType2.getId());
              try {
                JSONAssert.assertEquals(logicalElementType2.getData(), response.get(1).getData(), false);
              } catch (JSONException e) {
                throw new RuntimeException(e);
              }
              Assertions.assertThat(response.get(1).getVersion()).isEqualTo(logicalElementType2.getVersion());

              Assertions.assertThat(response.get(2).getId()).isEqualTo(logicalElementType3.getId());
              try {
                JSONAssert.assertEquals(logicalElementType3.getData(), response.get(2).getData(), false);
              } catch (JSONException e) {
                throw new RuntimeException(e);
              }
              Assertions.assertThat(response.get(2).getVersion()).isEqualTo(logicalElementType3.getVersion());


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

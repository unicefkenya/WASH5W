/*
 * Copyright (C) 2021 Second Mile
 *
 * This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0.
 * If a copy of the MPL was not distributed with this file,
 * You can obtain one at http://mozilla.org/MPL/2.0/.
 */
package ke.co.miles.dataformselementscategories;

import java.util.Collections;
import ke.co.miles.dataformselementscategories.models.DataFormElementCategory;
import ke.co.miles.dataformselementscategories.util.builders.DataFormElementCategoryBuilder;
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
@ContextConfiguration(initializers = RetrieveDataFormsElementsCategoriesIT.Initializer.class)
public class RetrieveDataFormsElementsCategoriesIT {

  static final PostgreSQLContainer postgreSQLContainer;
  static final DataFormElementCategory dataFormElementCategory1;
  static final DataFormElementCategory dataFormElementCategory2;
  static final DataFormElementCategory dataFormElementCategory3;

  static {

    postgreSQLContainer =
        new PostgreSQLContainer("postgres:10.15")
            .withDatabaseName("test")
            .withUsername("postgres")
            .withPassword("postgres");

    postgreSQLContainer
        .withInitScript("init.sql")
        .start();

    dataFormElementCategory1 =
        new DataFormElementCategoryBuilder()
            .id(1L)
            .data(
                "{\"name\":\"First Data Form Element Category Name\"}")
            .version(1)
            .build();

    dataFormElementCategory2 =
        new DataFormElementCategoryBuilder()
            .id(2L)
            .data(
                "{\"name\":\"Second Data Form Element Category Name\"}")
            .version(1)
            .build();

    dataFormElementCategory3 =
        new DataFormElementCategoryBuilder()
            .id(3L)
            .data(
                "{\"name\":\"Third Data Form Element Category Name\"}")
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
  public void Given_DataFormElementCategoryRecordsExist_When_GetAllWithNameFilter_Then_OnlyDataFormElementCategoryRecordsWithTheSpecifiedNameWillBeReturned() {

    webTestClient
        .get()
        .uri(uriBuilder ->
            uriBuilder
                .path("/api/v1/data_forms_elements_categories")
                .queryParam("name", "{param1}")
                .build("Third Data Form Element Category Name"))
        .exchange()
        .expectStatus().isOk()
        .expectBodyList(DataFormElementCategory.class)
        .value(response -> {

              Collections.sort(response);

              Assertions.assertThat(response.get(0).getId()).isEqualTo(dataFormElementCategory3.getId());
              try {
                JSONAssert.assertEquals(dataFormElementCategory3.getData(), response.get(0).getData(), false);
              } catch (JSONException e) {
                throw new RuntimeException(e);
              }
              Assertions.assertThat(response.get(0).getVersion()).isEqualTo(1);


            }
        );
  }


  @Test
  public void Given_DataFormElementCategoryRecordsExist_When_GetAllWithNameFragmentFilter_Then_OnlyDataFormElementCategoryRecordsWithTheSpecifiedNameFragmentWillBeReturned() {

    webTestClient
        .get()
        .uri(uriBuilder ->
            uriBuilder
                .path("/api/v1/data_forms_elements_categories")
                .queryParam("name_like", "{param1}")
                .build("Thi"))
        .exchange()
        .expectStatus().isOk()
        .expectBodyList(DataFormElementCategory.class)
        .value(response -> {

              Collections.sort(response);

              Assertions.assertThat(response.get(0).getId()).isEqualTo(dataFormElementCategory3.getId());
              try {
                JSONAssert.assertEquals(dataFormElementCategory3.getData(), response.get(0).getData(), false);
              } catch (JSONException e) {
                throw new RuntimeException(e);
              }
              Assertions.assertThat(response.get(0).getVersion()).isEqualTo(1);


            }
        );
  }

  @Test
  public void Given_DataFormElementCategoryRecordsExist_When_GetAllWithoutFilters_Then_AllDataFormElementCategoryRecordsWillBeReturned() {

    webTestClient
        .get()
        .uri(uriBuilder ->
            uriBuilder
                .path("/api/v1/data_forms_elements_categories")
                .build())
        .exchange()
        .expectStatus().isOk()
        .expectBodyList(DataFormElementCategory.class)
        .value(response -> {

              Collections.sort(response);

              Assertions.assertThat(response.get(0).getId()).isEqualTo(dataFormElementCategory1.getId());
              try {
                JSONAssert.assertEquals(dataFormElementCategory1.getData(), response.get(0).getData(), false);
              } catch (JSONException e) {
                throw new RuntimeException(e);
              }
              Assertions.assertThat(response.get(0).getVersion()).isEqualTo(dataFormElementCategory1.getVersion());

              Assertions.assertThat(response.get(1).getId()).isEqualTo(dataFormElementCategory2.getId());
              try {
                JSONAssert.assertEquals(dataFormElementCategory2.getData(), response.get(1).getData(), false);
              } catch (JSONException e) {
                throw new RuntimeException(e);
              }
              Assertions.assertThat(response.get(1).getVersion()).isEqualTo(dataFormElementCategory2.getVersion());

              Assertions.assertThat(response.get(2).getId()).isEqualTo(dataFormElementCategory3.getId());
              try {
                JSONAssert.assertEquals(dataFormElementCategory3.getData(), response.get(2).getData(), false);
              } catch (JSONException e) {
                throw new RuntimeException(e);
              }
              Assertions.assertThat(response.get(2).getVersion()).isEqualTo(dataFormElementCategory3.getVersion());


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

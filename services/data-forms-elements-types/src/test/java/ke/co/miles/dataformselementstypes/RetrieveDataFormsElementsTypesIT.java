/*
 * Copyright (C) 2021 Second Mile
 *
 * This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0.
 * If a copy of the MPL was not distributed with this file,
 * You can obtain one at http://mozilla.org/MPL/2.0/.
 */
package ke.co.miles.dataformselementstypes;

import java.util.Collections;
import ke.co.miles.dataformselementstypes.models.DataFormElementType;
import ke.co.miles.dataformselementstypes.util.builders.DataFormElementTypeBuilder;
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
@ContextConfiguration(initializers = RetrieveDataFormsElementsTypesIT.Initializer.class)
public class RetrieveDataFormsElementsTypesIT {

  static final PostgreSQLContainer postgreSQLContainer;
  static final DataFormElementType dataFormElementType1;
  static final DataFormElementType dataFormElementType2;
  static final DataFormElementType dataFormElementType3;

  static {

    postgreSQLContainer =
        new PostgreSQLContainer("postgres:10.15")
            .withDatabaseName("test")
            .withUsername("postgres")
            .withPassword("postgres");

    postgreSQLContainer
        .withInitScript("init.sql")
        .start();

    dataFormElementType1 =
        new DataFormElementTypeBuilder()
            .id(1L)
            .data(
                "{\"categoryId\":1,\"name\":\"First Data Form Element Type Name\",\"icon\": \"arrow-right\",\"operators\": []}")
            .version(1)
            .build();

    dataFormElementType2 =
        new DataFormElementTypeBuilder()
            .id(2L)
            .data(
                "{\"categoryId\":1,\"name\":\"Second Data Form Element Type Name\",\"icon\": \"arrow-right\",\"operators\": []}")
            .version(1)
            .build();

    dataFormElementType3 =
        new DataFormElementTypeBuilder()
            .id(3L)
            .data(
                "{\"categoryId\":1,\"name\":\"Third Data Form Element Type Name\",\"icon\": \"arrow-right\",\"operators\": []}")
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
  public void Given_DataFormElementTypeRecordsExist_When_GetAllWithNameFilter_Then_OnlyDataFormElementTypeRecordsWithTheSpecifiedNameWillBeReturned() {

    webTestClient
        .get()
        .uri(uriBuilder ->
            uriBuilder
                .path("/api/v1/data_forms_elements_types")
                .queryParam("name", "{param1}")
                .build("Third Data Form Element Type Name"))
        .exchange()
        .expectStatus().isOk()
        .expectBodyList(DataFormElementType.class)
        .value(response -> {

              Collections.sort(response);

              Assertions.assertThat(response.get(0).getId()).isEqualTo(dataFormElementType3.getId());
              try {
                JSONAssert.assertEquals(dataFormElementType3.getData(), response.get(0).getData(), false);
              } catch (JSONException e) {
                throw new RuntimeException(e);
              }
              Assertions.assertThat(response.get(0).getVersion()).isEqualTo(1);


            }
        );
  }


  @Test
  public void Given_DataFormElementTypeRecordsExist_When_GetAllWithNameFragmentFilter_Then_OnlyDataFormElementTypeRecordsWithTheSpecifiedNameFragmentWillBeReturned() {

    webTestClient
        .get()
        .uri(uriBuilder ->
            uriBuilder
                .path("/api/v1/data_forms_elements_types")
                .queryParam("name_like", "{param1}")
                .build("Thi"))
        .exchange()
        .expectStatus().isOk()
        .expectBodyList(DataFormElementType.class)
        .value(response -> {

              Collections.sort(response);

              Assertions.assertThat(response.get(0).getId()).isEqualTo(dataFormElementType3.getId());
              try {
                JSONAssert.assertEquals(dataFormElementType3.getData(), response.get(0).getData(), false);
              } catch (JSONException e) {
                throw new RuntimeException(e);
              }
              Assertions.assertThat(response.get(0).getVersion()).isEqualTo(1);


            }
        );
  }

  @Test
  public void Given_DataFormElementTypeRecordsExist_When_GetAllWithoutFilters_Then_AllDataFormElementTypeRecordsWillBeReturned() {

    webTestClient
        .get()
        .uri(uriBuilder ->
            uriBuilder
                .path("/api/v1/data_forms_elements_types")
                .build())
        .exchange()
        .expectStatus().isOk()
        .expectBodyList(DataFormElementType.class)
        .value(response -> {

              Collections.sort(response);

              Assertions.assertThat(response.get(0).getId()).isEqualTo(dataFormElementType1.getId());
              try {
                JSONAssert.assertEquals(dataFormElementType1.getData(), response.get(0).getData(), false);
              } catch (JSONException e) {
                throw new RuntimeException(e);
              }
              Assertions.assertThat(response.get(0).getVersion()).isEqualTo(dataFormElementType1.getVersion());

              Assertions.assertThat(response.get(1).getId()).isEqualTo(dataFormElementType2.getId());
              try {
                JSONAssert.assertEquals(dataFormElementType2.getData(), response.get(1).getData(), false);
              } catch (JSONException e) {
                throw new RuntimeException(e);
              }
              Assertions.assertThat(response.get(1).getVersion()).isEqualTo(dataFormElementType2.getVersion());

              Assertions.assertThat(response.get(2).getId()).isEqualTo(dataFormElementType3.getId());
              try {
                JSONAssert.assertEquals(dataFormElementType3.getData(), response.get(2).getData(), false);
              } catch (JSONException e) {
                throw new RuntimeException(e);
              }
              Assertions.assertThat(response.get(2).getVersion()).isEqualTo(dataFormElementType3.getVersion());


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

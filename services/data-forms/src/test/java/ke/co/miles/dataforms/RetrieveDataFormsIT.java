/*
 * Copyright (C) 2021 Second Mile
 *
 * This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0.
 * If a copy of the MPL was not distributed with this file,
 * You can obtain one at http://mozilla.org/MPL/2.0/.
 */
package ke.co.miles.dataforms;

import java.util.Collections;
import ke.co.miles.dataforms.models.DataForm;
import ke.co.miles.dataforms.util.builders.DataFormBuilder;
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
@ContextConfiguration(initializers = RetrieveDataFormsIT.Initializer.class)
public class RetrieveDataFormsIT {

  static final PostgreSQLContainer postgreSQLContainer;
  static final DataForm dataForm1;
  static final DataForm dataForm2;
  static final DataForm dataForm3;

  static {

    postgreSQLContainer =
        new PostgreSQLContainer("postgres:10.15")
            .withDatabaseName("test")
            .withUsername("postgres")
            .withPassword("postgres");

    postgreSQLContainer
        .withInitScript("init.sql")
        .start();

    dataForm1 =
        new DataFormBuilder()
            .id(1L)
            .data(
                "{\"contextId\": 1,\"name\": \"First Data Form Name\",\"workflow\": {\"id\": 1,\"name\": \"First Workflow Name\"}}")
            .version(1)
            .build();

    dataForm2 =
        new DataFormBuilder()
            .id(2L)
            .data(
                "{\"contextId\": 1,\"name\": \"Second Data Form Name\",\"workflow\": {\"id\": 1,\"name\": \"Second Workflow Name\"}}")
            .version(1)
            .build();

    dataForm3 =
        new DataFormBuilder()
            .id(3L)
            .data(
                "{\"contextId\": 1,\"name\": \"Third Data Form Name\",\"workflow\": {\"id\": 1,\"name\": \"Third Workflow Name\"}}")
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
  public void Given_DataFormRecordsExist_When_GetAllWithNameFilter_Then_OnlyDataFormRecordsWithTheSpecifiedNameWillBeReturned() {

    webTestClient
        .get()
        .uri(uriBuilder ->
            uriBuilder
                .path("/api/v1/data_forms")
                .queryParam("name", "{param1}")
                .build("Third Data Form Name"))
        .exchange()
        .expectStatus().isOk()
        .expectBodyList(DataForm.class)
        .value(response -> {

              Collections.sort(response);

              Assertions.assertThat(response.get(0).getId()).isEqualTo(dataForm3.getId());
              try {
                JSONAssert.assertEquals(dataForm3.getData(), response.get(0).getData(), false);
              } catch (JSONException e) {
                throw new RuntimeException(e);
              }
              Assertions.assertThat(response.get(0).getVersion()).isEqualTo(1);


            }
        );
  }


  @Test
  public void Given_DataFormRecordsExist_When_GetAllWithNameFragmentFilter_Then_OnlyDataFormRecordsWithTheSpecifiedNameFragmentWillBeReturned() {

    webTestClient
        .get()
        .uri(uriBuilder ->
            uriBuilder
                .path("/api/v1/data_forms")
                .queryParam("name_like", "{param1}")
                .build("Thi"))
        .exchange()
        .expectStatus().isOk()
        .expectBodyList(DataForm.class)
        .value(response -> {

              Collections.sort(response);

              Assertions.assertThat(response.get(0).getId()).isEqualTo(dataForm3.getId());
              try {
                JSONAssert.assertEquals(dataForm3.getData(), response.get(0).getData(), false);
              } catch (JSONException e) {
                throw new RuntimeException(e);
              }
              Assertions.assertThat(response.get(0).getVersion()).isEqualTo(1);


            }
        );
  }

  @Test
  public void Given_DataFormRecordsExist_When_GetAllWithoutFilters_Then_AllDataFormRecordsWillBeReturned() {

    webTestClient
        .get()
        .uri(uriBuilder ->
            uriBuilder
                .path("/api/v1/data_forms")
                .build())
        .exchange()
        .expectStatus().isOk()
        .expectBodyList(DataForm.class)
        .value(response -> {

              Collections.sort(response);

              Assertions.assertThat(response.get(0).getId()).isEqualTo(dataForm1.getId());
              try {
                JSONAssert.assertEquals(dataForm1.getData(), response.get(0).getData(), false);
              } catch (JSONException e) {
                throw new RuntimeException(e);
              }
              Assertions.assertThat(response.get(0).getVersion()).isEqualTo(dataForm1.getVersion());

              Assertions.assertThat(response.get(1).getId()).isEqualTo(dataForm2.getId());
              try {
                JSONAssert.assertEquals(dataForm2.getData(), response.get(1).getData(), false);
              } catch (JSONException e) {
                throw new RuntimeException(e);
              }
              Assertions.assertThat(response.get(1).getVersion()).isEqualTo(dataForm2.getVersion());

              Assertions.assertThat(response.get(2).getId()).isEqualTo(dataForm3.getId());
              try {
                JSONAssert.assertEquals(dataForm3.getData(), response.get(2).getData(), false);
              } catch (JSONException e) {
                throw new RuntimeException(e);
              }
              Assertions.assertThat(response.get(2).getVersion()).isEqualTo(dataForm3.getVersion());


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

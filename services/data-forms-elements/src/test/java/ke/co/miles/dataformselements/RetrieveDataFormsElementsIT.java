/*
 * Copyright (C) 2021 Second Mile
 *
 * This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0.
 * If a copy of the MPL was not distributed with this file,
 * You can obtain one at http://mozilla.org/MPL/2.0/.
 */
package ke.co.miles.dataformselements;

import java.util.Collections;
import ke.co.miles.dataformselements.models.DataFormElement;
import ke.co.miles.dataformselements.util.builders.DataFormElementBuilder;
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
@ContextConfiguration(initializers = RetrieveDataFormsElementsIT.Initializer.class)
public class RetrieveDataFormsElementsIT {

  static final PostgreSQLContainer postgreSQLContainer;
  static final DataFormElement dataFormElement1;
  static final DataFormElement dataFormElement2;
  static final DataFormElement dataFormElement3;

  static {

    postgreSQLContainer =
        new PostgreSQLContainer("postgres:10.15")
            .withDatabaseName("test")
            .withUsername("postgres")
            .withPassword("postgres");

    postgreSQLContainer
        .withInitScript("init.sql")
        .start();

    dataFormElement1 =
        new DataFormElementBuilder()
            .id(1L)
            .data(
                "{\"contextId\": 1,\"dataFormId\": 1,\"categoryId\": 1,\"typeId\": 1,\"layoutId\": 1,\"index\": null,\"code\": null,\"titled\": true,\"title\": \"First Title\",\"described\": true,\"description\": \"First Description\",\"conditionallyRelevant\": false,\"conditionalRelevancyRule\": null,\"repeated\": false,\"repeatabilityRule\": {},\"validated\": null,\"validationRules\": null,\"reserved\": null,\"hidden\": null,\"required\": null,\"options\": null}")
            .version(1)
            .build();

    dataFormElement2 =
        new DataFormElementBuilder()
            .id(2L)
            .data(
                "{\"contextId\": 2,\"dataFormId\": 2,\"categoryId\": 2,\"typeId\": 2,\"layoutId\": 2,\"index\": null,\"code\": null,\"titled\": true,\"title\": \"Second Title\",\"described\": true,\"description\": \"Second Description\",\"conditionallyRelevant\": false,\"conditionalRelevancyRule\": null,\"repeated\": false,\"repeatabilityRule\": {},\"validated\": null,\"validationRules\": null,\"reserved\": null,\"hidden\": null,\"required\": null,\"options\": null}")
            .version(1)
            .build();

    dataFormElement3 =
        new DataFormElementBuilder()
            .id(3L)
            .data(
                "{\"contextId\": 3,\"dataFormId\": 3,\"categoryId\": 3,\"typeId\": 3,\"layoutId\": 3,\"index\": null,\"code\": null,\"titled\": true,\"title\": \"Third Title\",\"described\": true,\"description\": \"Third Description\",\"conditionallyRelevant\": false,\"conditionalRelevancyRule\": null,\"repeated\": false,\"repeatabilityRule\": {},\"validated\": null,\"validationRules\": null,\"reserved\": null,\"hidden\": null,\"required\": null,\"options\": null}")
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
  public void Given_DataFormElementRecordsExist_When_GetAllWithNameFilter_Then_OnlyDataFormElementRecordsWithTheSpecifiedNameWillBeReturned() {

    webTestClient
        .get()
        .uri(uriBuilder ->
            uriBuilder
                .path("/api/v1/data_forms_elements")
                .queryParam("title", "{param1}")
                .build("Third Title"))
        .exchange()
        .expectStatus().isOk()
        .expectBodyList(DataFormElement.class)
        .value(response -> {

              Collections.sort(response);

              Assertions.assertThat(response.get(0).getId()).isEqualTo(dataFormElement3.getId());
              try {
                JSONAssert.assertEquals(dataFormElement3.getData(), response.get(0).getData(), false);
              } catch (JSONException e) {
                throw new RuntimeException(e);
              }
              Assertions.assertThat(response.get(0).getVersion()).isEqualTo(1);


            }
        );
  }


  @Test
  public void Given_DataFormElementRecordsExist_When_GetAllWithNameFragmentFilter_Then_OnlyDataFormElementRecordsWithTheSpecifiedNameFragmentWillBeReturned() {

    webTestClient
        .get()
        .uri(uriBuilder ->
            uriBuilder
                .path("/api/v1/data_forms_elements")
                .queryParam("title_like", "{param1}")
                .build("Thi"))
        .exchange()
        .expectStatus().isOk()
        .expectBodyList(DataFormElement.class)
        .value(response -> {

              Collections.sort(response);

              Assertions.assertThat(response.get(0).getId()).isEqualTo(dataFormElement3.getId());
              try {
                JSONAssert.assertEquals(dataFormElement3.getData(), response.get(0).getData(), false);
              } catch (JSONException e) {
                throw new RuntimeException(e);
              }
              Assertions.assertThat(response.get(0).getVersion()).isEqualTo(1);


            }
        );
  }

  @Test
  public void Given_DataFormElementRecordsExist_When_GetAllWithoutFilters_Then_AllDataFormElementRecordsWillBeReturned() {

    webTestClient
        .get()
        .uri(uriBuilder ->
            uriBuilder
                .path("/api/v1/data_forms_elements")
                .build())
        .exchange()
        .expectStatus().isOk()
        .expectBodyList(DataFormElement.class)
        .value(response -> {

              Collections.sort(response);

              Assertions.assertThat(response.get(0).getId()).isEqualTo(dataFormElement1.getId());
              try {
                JSONAssert.assertEquals(dataFormElement1.getData(), response.get(0).getData(), false);
              } catch (JSONException e) {
                throw new RuntimeException(e);
              }
              Assertions.assertThat(response.get(0).getVersion()).isEqualTo(dataFormElement1.getVersion());

              Assertions.assertThat(response.get(1).getId()).isEqualTo(dataFormElement2.getId());
              try {
                JSONAssert.assertEquals(dataFormElement2.getData(), response.get(1).getData(), false);
              } catch (JSONException e) {
                throw new RuntimeException(e);
              }
              Assertions.assertThat(response.get(1).getVersion()).isEqualTo(dataFormElement2.getVersion());

              Assertions.assertThat(response.get(2).getId()).isEqualTo(dataFormElement3.getId());
              try {
                JSONAssert.assertEquals(dataFormElement3.getData(), response.get(2).getData(), false);
              } catch (JSONException e) {
                throw new RuntimeException(e);
              }
              Assertions.assertThat(response.get(2).getVersion()).isEqualTo(dataFormElement3.getVersion());


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

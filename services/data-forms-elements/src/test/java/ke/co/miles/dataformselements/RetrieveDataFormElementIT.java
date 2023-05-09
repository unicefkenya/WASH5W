/*
 * Copyright (C) 2021 Second Mile
 *
 * This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0.
 * If a copy of the MPL was not distributed with this file,
 * You can obtain one at http://mozilla.org/MPL/2.0/.
 */
package ke.co.miles.dataformselements;

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
@ContextConfiguration(initializers = RetrieveDataFormElementIT.Initializer.class)
public class RetrieveDataFormElementIT {

  static final PostgreSQLContainer postgreSQLContainer;
  static final DataFormElement dataFormElement1;

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
  }

  @Autowired
  WebTestClient webTestClient;

  @AfterClass
  public static void shutdown() {

    postgreSQLContainer.stop();
  }

  @Test
  public void Given_DataFormElementRecordExists_When_GetWithIdParameter_Then_TheDataFormElementRecordWithThatIdWillBeReturned() {

    webTestClient
        .get()
        .uri(uriBuilder ->
            uriBuilder
                .path("/api/v1/data_forms_elements/{id}")
                .build(Long.toString(dataFormElement1.getId())))
        .exchange()
        .expectStatus().isOk()
        .expectBody(DataFormElement.class)
        .value(response -> {
              Assertions.assertThat(response.getId()).isEqualTo(dataFormElement1.getId());
              try {
                JSONAssert.assertEquals(dataFormElement1.getData(), response.getData(), false);
              } catch (JSONException e) {
                throw new RuntimeException(e);
              }
              Assertions.assertThat(response.getVersion()).isEqualTo(dataFormElement1.getVersion());
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

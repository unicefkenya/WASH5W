/*
 * Copyright (C) 2021 Second Mile
 *
 * This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0.
 * If a copy of the MPL was not distributed with this file,
 * You can obtain one at http://mozilla.org/MPL/2.0/.
 */
package ke.co.miles.operators;

import java.util.Collections;
import ke.co.miles.operators.models.Operator;
import ke.co.miles.operators.util.builders.OperatorBuilder;
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
@ContextConfiguration(initializers = RetrieveOperatorsIT.Initializer.class)
public class RetrieveOperatorsIT {

  static final PostgreSQLContainer postgreSQLContainer;
  static final Operator operator1;
  static final Operator operator2;
  static final Operator operator3;

  static {

    postgreSQLContainer =
        new PostgreSQLContainer("postgres:10.15")
            .withDatabaseName("test")
            .withUsername("postgres")
            .withPassword("postgres");

    postgreSQLContainer
        .withInitScript("init.sql")
        .start();

    operator1 =
        new OperatorBuilder()
            .id(1L)
            .data(
                    "{\"typeId\":\"1\",\"name\":\"First Name\"}")
            .version(1)
            .build();

    operator2 =
        new OperatorBuilder()
            .id(2L)
            .data(
                    "{\"typeId\":\"2\",\"name\":\"Second Name\"}")
            .version(1)
            .build();

    operator3 =
        new OperatorBuilder()
            .id(3L)
            .data(
                    "{\"typeId\":\"3\",\"name\":\"Third Name\"}")
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
  public void Given_OperatorRecordsExist_When_GetAllWithNameFilter_Then_OnlyOperatorRecordsWithTheSpecifiedNameWillBeReturned() {

    webTestClient
        .get()
        .uri(uriBuilder ->
            uriBuilder
                .path("/api/v1/operators")
                .queryParam("name", "{param1}")
                .build("Third Name"))
        .exchange()
        .expectStatus().isOk()
        .expectBodyList(Operator.class)
        .value(response -> {

              Collections.sort(response);

              Assertions.assertThat(response.get(0).getId()).isEqualTo(operator3.getId());
              try {
                JSONAssert.assertEquals(operator3.getData(), response.get(0).getData(), false);
              } catch (JSONException e) {
                throw new RuntimeException(e);
              }
              Assertions.assertThat(response.get(0).getVersion()).isEqualTo(1);


            }
        );
  }


  @Test
  public void Given_OperatorRecordsExist_When_GetAllWithNameFragmentFilter_Then_OnlyOperatorRecordsWithTheSpecifiedNameFragmentWillBeReturned() {

    webTestClient
        .get()
        .uri(uriBuilder ->
            uriBuilder
                .path("/api/v1/operators")
                .queryParam("name_like", "{param1}")
                .build("T"))
        .exchange()
        .expectStatus().isOk()
        .expectBodyList(Operator.class)
        .value(response -> {

              Collections.sort(response);

              Assertions.assertThat(response.get(0).getId()).isEqualTo(operator3.getId());
              try {
                JSONAssert.assertEquals(operator3.getData(), response.get(0).getData(), false);
              } catch (JSONException e) {
                throw new RuntimeException(e);
              }
              Assertions.assertThat(response.get(0).getVersion()).isEqualTo(1);


            }
        );
  }


  @Test
  public void Given_OperatorRecordsExist_When_GetAllWithoutFilters_Then_AllOperatorRecordsWillBeReturned() {

    webTestClient
        .get()
        .uri(uriBuilder ->
            uriBuilder
                .path("/api/v1/operators")
                .build())
        .exchange()
        .expectStatus().isOk()
        .expectBodyList(Operator.class)
        .value(response -> {

              Collections.sort(response);

              Assertions.assertThat(response.get(0).getId()).isEqualTo(operator1.getId());
              try {
                JSONAssert.assertEquals(operator1.getData(), response.get(0).getData(), false);
              } catch (JSONException e) {
                throw new RuntimeException(e);
              }
              Assertions.assertThat(response.get(0).getVersion()).isEqualTo(operator1.getVersion());

              Assertions.assertThat(response.get(1).getId()).isEqualTo(operator2.getId());
              try {
                JSONAssert.assertEquals(operator2.getData(), response.get(1).getData(), false);
              } catch (JSONException e) {
                throw new RuntimeException(e);
              }
              Assertions.assertThat(response.get(1).getVersion()).isEqualTo(operator2.getVersion());

              Assertions.assertThat(response.get(2).getId()).isEqualTo(operator3.getId());
              try {
                JSONAssert.assertEquals(operator3.getData(), response.get(2).getData(), false);
              } catch (JSONException e) {
                throw new RuntimeException(e);
              }
              Assertions.assertThat(response.get(2).getVersion()).isEqualTo(operator3.getVersion());


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

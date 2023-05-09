/*
 * Copyright (C) 2021 Second Mile
 *
 * This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0.
 * If a copy of the MPL was not distributed with this file,
 * You can obtain one at http://mozilla.org/MPL/2.0/.
 */
package ke.co.miles.contexts;

import java.util.Collections;
import ke.co.miles.contexts.models.Context;
import ke.co.miles.contexts.util.builders.ContextBuilder;
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
@ContextConfiguration(initializers = RetrieveContextsIT.Initializer.class)
public class RetrieveContextsIT {

  static final PostgreSQLContainer postgreSQLContainer;
  static final Context context1;
  static final Context context2;
  static final Context context3;

  static {

    postgreSQLContainer =
        new PostgreSQLContainer("postgres:10.15")
            .withDatabaseName("test")
            .withUsername("postgres")
            .withPassword("postgres");

    postgreSQLContainer
        .withInitScript("init.sql")
        .start();

    context1 =
        new ContextBuilder()
            .id(1L)
            .data(
                "{\"name\":\"First Context\",\"abbreviation\":\"1st\",\"description\":\"First Description\",\"timestep\":{\"id\":1,\"name\":\"First\"},\"entitiesTypesIds\":[1]}")
            .version(1)
            .build();

    context2 =
        new ContextBuilder()
            .id(2L)
            .data(
                "{\"name\":\"Second Context\",\"abbreviation\":\"2nd\",\"description\":\"Second Description\",\"timestep\":{\"id\":2,\"name\":\"Second\"},\"entitiesTypesIds\":[2]}")
            .version(1)
            .build();

    context3 =
        new ContextBuilder()
            .id(3L)
            .data(
                "{\"name\":\"Third Context\",\"abbreviation\":\"3rd\",\"description\":\"Third Description\",\"timestep\":{\"id\":3,\"name\":\"Third\"},\"entitiesTypesIds\":[3]}")
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
  public void Given_ContextRecordsExist_When_GetAllWithNameFilter_Then_OnlyContextRecordsWithTheSpecifiedNameWillBeReturned() {

    webTestClient
        .get()
        .uri(uriBuilder ->
            uriBuilder
                .path("/api/v1/contexts")
                .queryParam("name", "{param1}")
                .build("Third Context"))
        .exchange()
        .expectStatus().isOk()
        .expectBodyList(Context.class)
        .value(response -> {

              Collections.sort(response);

              Assertions.assertThat(response.get(0).getId()).isEqualTo(context3.getId());
              try {
                JSONAssert.assertEquals(context3.getData(), response.get(0).getData(), false);
              } catch (JSONException e) {
                throw new RuntimeException(e);
              }
              Assertions.assertThat(response.get(0).getVersion()).isEqualTo(1);


            }
        );
  }


  @Test
  public void Given_ContextRecordsExist_When_GetAllWithNameFragmentFilter_Then_OnlyContextRecordsWithTheSpecifiedNameFragmentWillBeReturned() {

    webTestClient
        .get()
        .uri(uriBuilder ->
            uriBuilder
                .path("/api/v1/contexts")
                .queryParam("name_like", "{param1}")
                .build("Thi"))
        .exchange()
        .expectStatus().isOk()
        .expectBodyList(Context.class)
        .value(response -> {

              Collections.sort(response);

              Assertions.assertThat(response.get(0).getId()).isEqualTo(context3.getId());
              try {
                JSONAssert.assertEquals(context3.getData(), response.get(0).getData(), false);
              } catch (JSONException e) {
                throw new RuntimeException(e);
              }
              Assertions.assertThat(response.get(0).getVersion()).isEqualTo(1);


            }
        );
  }

  @Test
  public void Given_ContextRecordsExist_When_GetAllWithAbbreviationFilter_Then_OnlyContextRecordsWithTheSpecifiedAbbreviationWillBeReturned() {

    webTestClient
        .get()
        .uri(uriBuilder ->
            uriBuilder
                .path("/api/v1/contexts")
                .queryParam("abbreviation", "{param1}")
                .build("3rd"))
        .exchange()
        .expectStatus().isOk()
        .expectBodyList(Context.class)
        .value(response -> {

              Collections.sort(response);

              Assertions.assertThat(response.get(0).getId()).isEqualTo(context3.getId());
              try {
                JSONAssert.assertEquals(context3.getData(), response.get(0).getData(), false);
              } catch (JSONException e) {
                throw new RuntimeException(e);
              }
              Assertions.assertThat(response.get(0).getVersion()).isEqualTo(1);


            }
        );
  }


  @Test
  public void Given_ContextRecordsExist_When_GetAllWithAbbreviationFragmentFilter_Then_OnlyContextRecordsWithTheSpecifiedAbbreviationFragmentWillBeReturned() {

    webTestClient
        .get()
        .uri(uriBuilder ->
            uriBuilder
                .path("/api/v1/contexts")
                .queryParam("abbreviation_like", "{param1}")
                .build("3"))
        .exchange()
        .expectStatus().isOk()
        .expectBodyList(Context.class)
        .value(response -> {

              Collections.sort(response);

              Assertions.assertThat(response.get(0).getId()).isEqualTo(context3.getId());
              try {
                JSONAssert.assertEquals(context3.getData(), response.get(0).getData(), false);
              } catch (JSONException e) {
                throw new RuntimeException(e);
              }
              Assertions.assertThat(response.get(0).getVersion()).isEqualTo(1);


            }
        );
  }

  @Test
  public void Given_ContextRecordsExist_When_GetAllWithTimestepIdFilter_Then_OnlyContextRecordsWithTheSpecifiedTimestepIdWillBeReturned() {

    webTestClient
        .get()
        .uri(uriBuilder ->
            uriBuilder
                .path("/api/v1/contexts")
                .queryParam("timestep.id", "{param1}")
                .build("3"))
        .exchange()
        .expectStatus().isOk()
        .expectBodyList(Context.class)
        .value(response -> {

              Collections.sort(response);

              Assertions.assertThat(response.get(0).getId()).isEqualTo(context3.getId());
              try {
                JSONAssert.assertEquals(context3.getData(), response.get(0).getData(), false);
              } catch (JSONException e) {
                throw new RuntimeException(e);
              }
              Assertions.assertThat(response.get(0).getVersion()).isEqualTo(1);


            }
        );
  }

  @Test
  public void Given_ContextRecordsExist_When_GetAllWithoutFilters_Then_AllContextRecordsWillBeReturned() {

    webTestClient
        .get()
        .uri(uriBuilder ->
            uriBuilder
                .path("/api/v1/contexts")
                .build())
        .exchange()
        .expectStatus().isOk()
        .expectBodyList(Context.class)
        .value(response -> {

              Collections.sort(response);

              Assertions.assertThat(response.get(0).getId()).isEqualTo(context1.getId());
              try {
                JSONAssert.assertEquals(context1.getData(), response.get(0).getData(), false);
              } catch (JSONException e) {
                throw new RuntimeException(e);
              }
              Assertions.assertThat(response.get(0).getVersion()).isEqualTo(context1.getVersion());

              Assertions.assertThat(response.get(1).getId()).isEqualTo(context2.getId());
              try {
                JSONAssert.assertEquals(context2.getData(), response.get(1).getData(), false);
              } catch (JSONException e) {
                throw new RuntimeException(e);
              }
              Assertions.assertThat(response.get(1).getVersion()).isEqualTo(context2.getVersion());

              Assertions.assertThat(response.get(2).getId()).isEqualTo(context3.getId());
              try {
                JSONAssert.assertEquals(context3.getData(), response.get(2).getData(), false);
              } catch (JSONException e) {
                throw new RuntimeException(e);
              }
              Assertions.assertThat(response.get(2).getVersion()).isEqualTo(context3.getVersion());


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

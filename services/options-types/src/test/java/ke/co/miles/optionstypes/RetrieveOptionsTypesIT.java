/*
 * Copyright (C) 2021 Second Mile
 *
 * This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0.
 * If a copy of the MPL was not distributed with this file,
 * You can obtain one at http://mozilla.org/MPL/2.0/.
 */
package ke.co.miles.optionstypes;

import java.util.Collections;
import ke.co.miles.optionstypes.models.OptionType;
import ke.co.miles.optionstypes.util.builders.OptionTypeBuilder;
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
@ContextConfiguration(initializers = RetrieveOptionsTypesIT.Initializer.class)
public class RetrieveOptionsTypesIT {

  static final PostgreSQLContainer postgreSQLContainer;
  static final OptionType optionType1;
  static final OptionType optionType2;
  static final OptionType optionType3;

  static {

    postgreSQLContainer =
        new PostgreSQLContainer("postgres:10.15")
            .withDatabaseName("test")
            .withUsername("postgres")
            .withPassword("postgres");

    postgreSQLContainer
        .withInitScript("init.sql")
        .start();

    optionType1 =
        new OptionTypeBuilder()
            .id(1L)
            .data(
                "{\"name\":\"First Option Type Name\"}")
            .version(1)
            .build();

    optionType2 =
        new OptionTypeBuilder()
            .id(2L)
            .data(
                "{\"name\":\"Second Option Type Name\"}")
            .version(1)
            .build();

    optionType3 =
        new OptionTypeBuilder()
            .id(3L)
            .data(
                "{\"name\":\"Third Option Type Name\"}")
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
  public void Given_OptionTypeRecordsExist_When_GetAllWithNameFilter_Then_OnlyOptionTypeRecordsWithTheSpecifiedNameWillBeReturned() {

    webTestClient
        .get()
        .uri(uriBuilder ->
            uriBuilder
                .path("/api/v1/options_types")
                .queryParam("name", "{param1}")
                .build("Third Option Type Name"))
        .exchange()
        .expectStatus().isOk()
        .expectBodyList(OptionType.class)
        .value(response -> {

              Collections.sort(response);

              Assertions.assertThat(response.get(0).getId()).isEqualTo(optionType3.getId());
              try {
                JSONAssert.assertEquals(optionType3.getData(), response.get(0).getData(), false);
              } catch (JSONException e) {
                throw new RuntimeException(e);
              }
              Assertions.assertThat(response.get(0).getVersion()).isEqualTo(1);


            }
        );
  }


  @Test
  public void Given_OptionTypeRecordsExist_When_GetAllWithNameFragmentFilter_Then_OnlyOptionTypeRecordsWithTheSpecifiedNameFragmentWillBeReturned() {

    webTestClient
        .get()
        .uri(uriBuilder ->
            uriBuilder
                .path("/api/v1/options_types")
                .queryParam("name_like", "{param1}")
                .build("Thi"))
        .exchange()
        .expectStatus().isOk()
        .expectBodyList(OptionType.class)
        .value(response -> {

              Collections.sort(response);

              Assertions.assertThat(response.get(0).getId()).isEqualTo(optionType3.getId());
              try {
                JSONAssert.assertEquals(optionType3.getData(), response.get(0).getData(), false);
              } catch (JSONException e) {
                throw new RuntimeException(e);
              }
              Assertions.assertThat(response.get(0).getVersion()).isEqualTo(1);


            }
        );
  }

  @Test
  public void Given_OptionTypeRecordsExist_When_GetAllWithoutFilters_Then_AllOptionTypeRecordsWillBeReturned() {

    webTestClient
        .get()
        .uri(uriBuilder ->
            uriBuilder
                .path("/api/v1/options_types")
                .build())
        .exchange()
        .expectStatus().isOk()
        .expectBodyList(OptionType.class)
        .value(response -> {

              Collections.sort(response);

              Assertions.assertThat(response.get(0).getId()).isEqualTo(optionType1.getId());
              try {
                JSONAssert.assertEquals(optionType1.getData(), response.get(0).getData(), false);
              } catch (JSONException e) {
                throw new RuntimeException(e);
              }
              Assertions.assertThat(response.get(0).getVersion()).isEqualTo(optionType1.getVersion());

              Assertions.assertThat(response.get(1).getId()).isEqualTo(optionType2.getId());
              try {
                JSONAssert.assertEquals(optionType2.getData(), response.get(1).getData(), false);
              } catch (JSONException e) {
                throw new RuntimeException(e);
              }
              Assertions.assertThat(response.get(1).getVersion()).isEqualTo(optionType2.getVersion());

              Assertions.assertThat(response.get(2).getId()).isEqualTo(optionType3.getId());
              try {
                JSONAssert.assertEquals(optionType3.getData(), response.get(2).getData(), false);
              } catch (JSONException e) {
                throw new RuntimeException(e);
              }
              Assertions.assertThat(response.get(2).getVersion()).isEqualTo(optionType3.getVersion());


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

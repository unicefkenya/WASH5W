/*
 * Copyright (C) 2021 Second Mile
 *
 * This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0.
 * If a copy of the MPL was not distributed with this file,
 * You can obtain one at http://mozilla.org/MPL/2.0/.
 */
package ke.co.miles.systemmodules;

import java.util.Collections;
import ke.co.miles.systemmodules.models.SystemModule;
import ke.co.miles.systemmodules.util.builders.SystemModuleBuilder;
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
@ContextConfiguration(initializers = RetrieveSystemsModulesIT.Initializer.class)
public class RetrieveSystemsModulesIT {

  static final PostgreSQLContainer postgreSQLContainer;
  static final SystemModule systemModule1;
  static final SystemModule systemModule2;
  static final SystemModule systemModule3;

  static {

    postgreSQLContainer =
        new PostgreSQLContainer("postgres:10.15")
            .withDatabaseName("test")
            .withUsername("postgres")
            .withPassword("postgres");

    postgreSQLContainer
        .withInitScript("init.sql")
        .start();

    systemModule1 =
        new SystemModuleBuilder()
            .id(1L)
            .data(
                "{\"name\":\"First System Module Name\",\"enabled\":true,\"customisable\":false}")
            .version(1)
            .build();

    systemModule2 =
        new SystemModuleBuilder()
            .id(2L)
            .data(
                "{\"name\":\"Second System Module Name\",\"enabled\":true,\"customisable\":false}")
            .version(1)
            .build();

    systemModule3 =
        new SystemModuleBuilder()
            .id(3L)
            .data(
                "{\"name\":\"Third System Module Name\",\"enabled\":true,\"customisable\":false}")
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
  public void Given_SystemModuleRecordsExist_When_GetAllWithNameFilter_Then_OnlySystemModuleRecordsWithTheSpecifiedNameWillBeReturned() {

    webTestClient
        .get()
        .uri(uriBuilder ->
            uriBuilder
                .path("/api/v1/systems_modules")
                .queryParam("name", "{param1}")
                .build("Third System Module Name"))
        .exchange()
        .expectStatus().isOk()
        .expectBodyList(SystemModule.class)
        .value(response -> {

              Collections.sort(response);

              Assertions.assertThat(response.get(0).getId()).isEqualTo(systemModule3.getId());
              try {
                JSONAssert.assertEquals(systemModule3.getData(), response.get(0).getData(), false);
              } catch (JSONException e) {
                throw new RuntimeException(e);
              }
              Assertions.assertThat(response.get(0).getVersion()).isEqualTo(1);


            }
        );
  }


  @Test
  public void Given_SystemModuleRecordsExist_When_GetAllWithNameFragmentFilter_Then_OnlySystemModuleRecordsWithTheSpecifiedNameFragmentWillBeReturned() {

    webTestClient
        .get()
        .uri(uriBuilder ->
            uriBuilder
                .path("/api/v1/systems_modules")
                .queryParam("name_like", "{param1}")
                .build("Thi"))
        .exchange()
        .expectStatus().isOk()
        .expectBodyList(SystemModule.class)
        .value(response -> {

              Collections.sort(response);

              Assertions.assertThat(response.get(0).getId()).isEqualTo(systemModule3.getId());
              try {
                JSONAssert.assertEquals(systemModule3.getData(), response.get(0).getData(), false);
              } catch (JSONException e) {
                throw new RuntimeException(e);
              }
              Assertions.assertThat(response.get(0).getVersion()).isEqualTo(1);


            }
        );
  }


  @Test
  public void Given_SystemModuleRecordsExist_When_GetAllWithoutFilters_Then_AllSystemModuleRecordsWillBeReturned() {

    webTestClient
        .get()
        .uri(uriBuilder ->
            uriBuilder
                .path("/api/v1/systems_modules")
                .build())
        .exchange()
        .expectStatus().isOk()
        .expectBodyList(SystemModule.class)
        .value(response -> {

              Collections.sort(response);

              Assertions.assertThat(response.get(0).getId()).isEqualTo(systemModule1.getId());
              try {
                JSONAssert.assertEquals(systemModule1.getData(), response.get(0).getData(), false);
              } catch (JSONException e) {
                throw new RuntimeException(e);
              }
              Assertions.assertThat(response.get(0).getVersion()).isEqualTo(systemModule1.getVersion());

              Assertions.assertThat(response.get(1).getId()).isEqualTo(systemModule2.getId());
              try {
                JSONAssert.assertEquals(systemModule2.getData(), response.get(1).getData(), false);
              } catch (JSONException e) {
                throw new RuntimeException(e);
              }
              Assertions.assertThat(response.get(1).getVersion()).isEqualTo(systemModule2.getVersion());

              Assertions.assertThat(response.get(2).getId()).isEqualTo(systemModule3.getId());
              try {
                JSONAssert.assertEquals(systemModule3.getData(), response.get(2).getData(), false);
              } catch (JSONException e) {
                throw new RuntimeException(e);
              }
              Assertions.assertThat(response.get(2).getVersion()).isEqualTo(systemModule3.getVersion());


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

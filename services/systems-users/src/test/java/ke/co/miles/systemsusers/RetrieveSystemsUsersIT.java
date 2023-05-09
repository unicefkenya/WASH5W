/*
 * Copyright (C) 2021 Second Mile
 *
 * This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0.
 * If a copy of the MPL was not distributed with this file,
 * You can obtain one at http://mozilla.org/MPL/2.0/.
 */
package ke.co.miles.systemsusers;

import java.util.Collections;
import ke.co.miles.systemsusers.models.SystemUser;
import ke.co.miles.systemsusers.util.builders.SystemUserBuilder;
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
@ContextConfiguration(initializers = RetrieveSystemsUsersIT.Initializer.class)
public class RetrieveSystemsUsersIT {

  static final PostgreSQLContainer postgreSQLContainer;
  static final SystemUser systemUser1;
  static final SystemUser systemUser2;
  static final SystemUser systemUser3;

  static {

    postgreSQLContainer =
        new PostgreSQLContainer("postgres:10.15")
            .withDatabaseName("test")
            .withUsername("postgres")
            .withPassword("postgres");

    postgreSQLContainer
        .withInitScript("init.sql")
        .start();

    systemUser1 =
        new SystemUserBuilder()
            .id(1L)
            .data(
                "{\"name\":\"First System User Name\",\"email\":\"FirstSystemUserName@gmail.com\",\"password\":\"letmein1\",\"enabled\":true,\"confirmed\":true}")
            .version(1)
            .build();

    systemUser2 =
        new SystemUserBuilder()
            .id(2L)
            .data(
                "{\"name\":\"Second System User Name\",\"email\":\"SecondSystemUserName@gmail.com\",\"password\":\"letmein2\",\"enabled\":true,\"confirmed\":true}")
            .version(1)
            .build();

    systemUser3 =
        new SystemUserBuilder()
            .id(3L)
            .data(
                "{\"name\":\"Third System User Name\",\"email\":\"ThirdSystemUserName@gmail.com\",\"password\":\"letmein3\",\"enabled\":true,\"confirmed\":true}")
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
  public void Given_SystemUserRecordsExist_When_GetAllWithNameFilter_Then_OnlySystemUserRecordsWithTheSpecifiedNameWillBeReturned() {

    webTestClient
        .get()
        .uri(uriBuilder ->
            uriBuilder
                .path("/api/v1/systems_users")
                .queryParam("name", "{param1}")
                .build("Third System User Name"))
        .exchange()
        .expectStatus().isOk()
        .expectBodyList(SystemUser.class)
        .value(response -> {

              Collections.sort(response);

              Assertions.assertThat(response.get(0).getId()).isEqualTo(systemUser3.getId());
              try {
                JSONAssert.assertEquals(systemUser3.getData(), response.get(0).getData(), false);
              } catch (JSONException e) {
                throw new RuntimeException(e);
              }
              Assertions.assertThat(response.get(0).getVersion()).isEqualTo(1);


            }
        );
  }


  @Test
  public void Given_SystemUserRecordsExist_When_GetAllWithNameFragmentFilter_Then_OnlySystemUserRecordsWithTheSpecifiedNameFragmentWillBeReturned() {

    webTestClient
        .get()
        .uri(uriBuilder ->
            uriBuilder
                .path("/api/v1/systems_users")
                .queryParam("name_like", "{param1}")
                .build("Thi"))
        .exchange()
        .expectStatus().isOk()
        .expectBodyList(SystemUser.class)
        .value(response -> {

              Collections.sort(response);

              Assertions.assertThat(response.get(0).getId()).isEqualTo(systemUser3.getId());
              try {
                JSONAssert.assertEquals(systemUser3.getData(), response.get(0).getData(), false);
              } catch (JSONException e) {
                throw new RuntimeException(e);
              }
              Assertions.assertThat(response.get(0).getVersion()).isEqualTo(1);


            }
        );
  }

  @Test
  public void Given_SystemUserRecordsExist_When_GetAllWithoutFilters_Then_AllSystemUserRecordsWillBeReturned() {

    webTestClient
        .get()
        .uri(uriBuilder ->
            uriBuilder
                .path("/api/v1/systems_users")
                .build())
        .exchange()
        .expectStatus().isOk()
        .expectBodyList(SystemUser.class)
        .value(response -> {

              Collections.sort(response);

              Assertions.assertThat(response.get(0).getId()).isEqualTo(systemUser1.getId());
              try {
                JSONAssert.assertEquals(systemUser1.getData(), response.get(0).getData(), false);
              } catch (JSONException e) {
                throw new RuntimeException(e);
              }
              Assertions.assertThat(response.get(0).getVersion()).isEqualTo(systemUser1.getVersion());

              Assertions.assertThat(response.get(1).getId()).isEqualTo(systemUser2.getId());
              try {
                JSONAssert.assertEquals(systemUser2.getData(), response.get(1).getData(), false);
              } catch (JSONException e) {
                throw new RuntimeException(e);
              }
              Assertions.assertThat(response.get(1).getVersion()).isEqualTo(systemUser2.getVersion());

              Assertions.assertThat(response.get(2).getId()).isEqualTo(systemUser3.getId());
              try {
                JSONAssert.assertEquals(systemUser3.getData(), response.get(2).getData(), false);
              } catch (JSONException e) {
                throw new RuntimeException(e);
              }
              Assertions.assertThat(response.get(2).getVersion()).isEqualTo(systemUser3.getVersion());


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

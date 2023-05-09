/*
 * Copyright (C) 2021 Second Mile
 *
 * This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0.
 * If a copy of the MPL was not distributed with this file,
 * You can obtain one at http://mozilla.org/MPL/2.0/.
 */
package ke.co.miles.systemsroles;

import java.util.Collections;
import ke.co.miles.systemsroles.models.SystemRole;
import ke.co.miles.systemsroles.util.builders.SystemRoleBuilder;
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
@ContextConfiguration(initializers = RetrieveSystemsRolesIT.Initializer.class)
public class RetrieveSystemsRolesIT {

  static final PostgreSQLContainer postgreSQLContainer;
  static final SystemRole systemRole1;
  static final SystemRole systemRole2;
  static final SystemRole systemRole3;

  static {

    postgreSQLContainer =
        new PostgreSQLContainer("postgres:10.15")
            .withDatabaseName("test")
            .withUsername("postgres")
            .withPassword("postgres");

    postgreSQLContainer
        .withInitScript("init.sql")
        .start();

    systemRole1 =
        new SystemRoleBuilder()
            .id(1L)
            .data("{\"code\":\"firstSystemRolesCode\",\"name\":\"First System Roles Name\",\"description\":\"First System Roles Description\",\"permissions\": [\"First System Roles Permissions\"],\"customisable\":false}")
            .version(1)
            .build();

    systemRole2 =
        new SystemRoleBuilder()
            .id(2L)
            .data("{\"code\":\"secondSystemRolesCode\",\"name\":\"Second System Roles Name\",\"description\":\"Second System Roles Description\",\"permissions\":[\"Second System Roles Permissions\"],\"customisable\":false}")
            .version(1)
            .build();

    systemRole3 =
        new SystemRoleBuilder()
            .id(3L)
            .data("{\"code\":\"thirdSystemRolesCode\",\"name\":\"Third System Roles Name\",\"description\":\"Third System Roles Description\",\"permissions\": [\"Third System Roles Permissions\"],\"customisable\":false}")
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
  public void Given_SystemRoleRecordsExist_When_GetAllWithCodeFilter_Then_OnlySystemRoleRecordsWithTheSpecifiedCodeWillBeReturned() {

    webTestClient
        .get()
        .uri(uriBuilder ->
            uriBuilder
                .path("/api/v1/systems_roles")
                .queryParam("code", "{param1}")
                .build("thirdSystemRolesCode"))
        .exchange()
        .expectStatus().isOk()
        .expectBodyList(SystemRole.class)
        .value(response -> {

              Collections.sort(response);

              Assertions.assertThat(response.get(0).getId()).isEqualTo(systemRole3.getId());
              try {
                JSONAssert.assertEquals(systemRole3.getData(), response.get(0).getData(), false);
              } catch (JSONException e) {
                throw new RuntimeException(e);
              }
              Assertions.assertThat(response.get(0).getVersion()).isEqualTo(1);


            }
        );
  }

    @Test
    public void Given_SystemRoleRecordsExist_When_GetAllWithNameFilter_Then_OnlySystemRoleRecordsWithTheSpecifiedNameWillBeReturned() {

        webTestClient
                .get()
                .uri(uriBuilder ->
                        uriBuilder
                                .path("/api/v1/systems_roles")
                                .queryParam("name", "{param1}")
                                .build("Third System Roles Name"))
                .exchange()
                .expectStatus().isOk()
                .expectBodyList(SystemRole.class)
                .value(response -> {

                            Collections.sort(response);

                            Assertions.assertThat(response.get(0).getId()).isEqualTo(systemRole3.getId());
                            try {
                                JSONAssert.assertEquals(systemRole3.getData(), response.get(0).getData(), false);
                            } catch (JSONException e) {
                                throw new RuntimeException(e);
                            }
                            Assertions.assertThat(response.get(0).getVersion()).isEqualTo(1);


                        }
                );
    }



    @Test
  public void Given_SystemRoleRecordsExist_When_GetAllWithNameFragmentFilter_Then_OnlySystemRoleRecordsWithTheSpecifiedNameFragmentWillBeReturned() {

    webTestClient
        .get()
        .uri(uriBuilder ->
            uriBuilder
                .path("/api/v1/systems_roles")
                .queryParam("name_like", "{param1}")
                .build("Thi"))
        .exchange()
        .expectStatus().isOk()
        .expectBodyList(SystemRole.class)
        .value(response -> {

              Collections.sort(response);

              Assertions.assertThat(response.get(0).getId()).isEqualTo(systemRole3.getId());
              try {
                JSONAssert.assertEquals(systemRole3.getData(), response.get(0).getData(), false);
              } catch (JSONException e) {
                throw new RuntimeException(e);
              }
              Assertions.assertThat(response.get(0).getVersion()).isEqualTo(1);


            }
        );
  }


  @Test
  public void Given_SystemRoleRecordsExist_When_GetAllWithoutFilters_Then_AllSystemRoleRecordsWillBeReturned() {

    webTestClient
        .get()
        .uri(uriBuilder ->
            uriBuilder
                .path("/api/v1/systems_roles")
                .build())
        .exchange()
        .expectStatus().isOk()
        .expectBodyList(SystemRole.class)
        .value(response -> {

              Collections.sort(response);

              Assertions.assertThat(response.get(0).getId()).isEqualTo(systemRole1.getId());
              try {
                JSONAssert.assertEquals(systemRole1.getData(), response.get(0).getData(), false);
              } catch (JSONException e) {
                throw new RuntimeException(e);
              }
              Assertions.assertThat(response.get(0).getVersion()).isEqualTo(systemRole1.getVersion());

              Assertions.assertThat(response.get(1).getId()).isEqualTo(systemRole2.getId());
              try {
                JSONAssert.assertEquals(systemRole2.getData(), response.get(1).getData(), false);
              } catch (JSONException e) {
                throw new RuntimeException(e);
              }
              Assertions.assertThat(response.get(1).getVersion()).isEqualTo(systemRole2.getVersion());

              Assertions.assertThat(response.get(2).getId()).isEqualTo(systemRole3.getId());
              try {
                JSONAssert.assertEquals(systemRole3.getData(), response.get(2).getData(), false);
              } catch (JSONException e) {
                throw new RuntimeException(e);
              }
              Assertions.assertThat(response.get(2).getVersion()).isEqualTo(systemRole3.getVersion());


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

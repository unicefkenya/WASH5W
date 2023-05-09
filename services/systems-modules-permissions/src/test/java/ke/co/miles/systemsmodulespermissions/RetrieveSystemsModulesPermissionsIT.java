/*
 * Copyright (C) 2021 Second Mile
 *
 * This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0.
 * If a copy of the MPL was not distributed with this file,
 * You can obtain one at http://mozilla.org/MPL/2.0/.
 */
package ke.co.miles.systemsmodulespermissions;

import java.util.Collections;
import ke.co.miles.systemsmodulespermissions.models.SystemModulePermission;
import ke.co.miles.systemsmodulespermissions.util.builders.SystemModulePermissionBuilder;
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
@ContextConfiguration(initializers = RetrieveSystemsModulesPermissionsIT.Initializer.class)
public class RetrieveSystemsModulesPermissionsIT {

  static final PostgreSQLContainer postgreSQLContainer;
  static final SystemModulePermission systemModulePermission1;
  static final SystemModulePermission systemModulePermission2;
  static final SystemModulePermission systemModulePermission3;

  static {

    postgreSQLContainer =
        new PostgreSQLContainer("postgres:10.15")
            .withDatabaseName("test")
            .withUsername("postgres")
            .withPassword("postgres");

    postgreSQLContainer
        .withInitScript("init.sql")
        .start();

    systemModulePermission1 =
        new SystemModulePermissionBuilder()
            .id(1L)
            .data("{\"systemModuleId\":1,\"code\":\"firstSystemModulePermissionCode\",\"name\":\"First System Module Permission Name\",\"description\":\"First System Module Permission Description\",\"custom\":false}")
            .version(1)
            .build();

    systemModulePermission2 =
        new SystemModulePermissionBuilder()
            .id(2L)
            .data("{\"systemModuleId\":2,\"code\":\"secondSystemModulePermissionCode\",\"name\":\"Second System Module Permission Name\",\"description\":\"Second System Module Permission Description\",\"custom\":false}")
            .version(1)
            .build();

    systemModulePermission3 =
        new SystemModulePermissionBuilder()
            .id(3L)
            .data("{\"systemModuleId\":3,\"code\":\"thirdSystemModulePermissionCode\",\"name\":\"Third System Module Permission Name\",\"description\":\"Third System Module Permission Description\",\"custom\":false}")
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
    public void Given_SystemModulePermissionRecordsExist_When_GetAllWithCodeFilter_Then_OnlySystemModulePermissionRecordsWithTheSpecifiedCodeWillBeReturned() {

        webTestClient
                .get()
                .uri(uriBuilder ->
                        uriBuilder
                                .path("/api/v1/systems_modules_permissions")
                                .queryParam("code", "{param1}")
                                .build("thirdSystemModulePermissionCode"))
                .exchange()
                .expectStatus().isOk()
                .expectBodyList(SystemModulePermission.class)
                .value(response -> {

                            Collections.sort(response);

                            Assertions.assertThat(response.get(0).getId()).isEqualTo(systemModulePermission3.getId());
                            try {
                                JSONAssert.assertEquals(systemModulePermission3.getData(), response.get(0).getData(), false);
                            } catch (JSONException e) {
                                throw new RuntimeException(e);
                            }
                            Assertions.assertThat(response.get(0).getVersion()).isEqualTo(1);


                        }
                );
    }


    @Test
  public void Given_SystemModulePermissionRecordsExist_When_GetAllWithNameFragmentFilter_Then_OnlySystemModulePermissionRecordsWithTheSpecifiedNameFragmentWillBeReturned() {

    webTestClient
        .get()
        .uri(uriBuilder ->
            uriBuilder
                .path("/api/v1/systems_modules_permissions")
                .queryParam("name_like", "{param1}")
                .build("Thi"))
        .exchange()
        .expectStatus().isOk()
        .expectBodyList(SystemModulePermission.class)
        .value(response -> {

              Collections.sort(response);

              Assertions.assertThat(response.get(0).getId()).isEqualTo(systemModulePermission3.getId());
              try {
                JSONAssert.assertEquals(systemModulePermission3.getData(), response.get(0).getData(), false);
              } catch (JSONException e) {
                throw new RuntimeException(e);
              }
              Assertions.assertThat(response.get(0).getVersion()).isEqualTo(1);


            }
        );
  }


  @Test
  public void Given_SystemModulePermissionRecordsExist_When_GetAllWithoutFilters_Then_AllSystemModulePermissionRecordsWillBeReturned() {

    webTestClient
        .get()
        .uri(uriBuilder ->
            uriBuilder
                .path("/api/v1/systems_modules_permissions")
                .build())
        .exchange()
        .expectStatus().isOk()
        .expectBodyList(SystemModulePermission.class)
        .value(response -> {

              Collections.sort(response);

              Assertions.assertThat(response.get(0).getId()).isEqualTo(systemModulePermission1.getId());
              try {
                JSONAssert.assertEquals(systemModulePermission1.getData(), response.get(0).getData(), false);
              } catch (JSONException e) {
                throw new RuntimeException(e);
              }
              Assertions.assertThat(response.get(0).getVersion()).isEqualTo(systemModulePermission1.getVersion());

              Assertions.assertThat(response.get(1).getId()).isEqualTo(systemModulePermission2.getId());
              try {
                JSONAssert.assertEquals(systemModulePermission2.getData(), response.get(1).getData(), false);
              } catch (JSONException e) {
                throw new RuntimeException(e);
              }
              Assertions.assertThat(response.get(1).getVersion()).isEqualTo(systemModulePermission2.getVersion());

              Assertions.assertThat(response.get(2).getId()).isEqualTo(systemModulePermission3.getId());
              try {
                JSONAssert.assertEquals(systemModulePermission3.getData(), response.get(2).getData(), false);
              } catch (JSONException e) {
                throw new RuntimeException(e);
              }
              Assertions.assertThat(response.get(2).getVersion()).isEqualTo(systemModulePermission3.getVersion());


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

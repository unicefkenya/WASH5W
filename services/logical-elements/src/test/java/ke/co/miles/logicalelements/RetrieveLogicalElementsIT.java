/*
 * Copyright (C) 2021 Second Mile
 *
 * This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0.
 * If a copy of the MPL was not distributed with this file,
 * You can obtain one at http://mozilla.org/MPL/2.0/.
 */
package ke.co.miles.logicalelements;

import java.util.Collections;
import ke.co.miles.logicalelements.models.LogicalElement;
import ke.co.miles.logicalelements.util.builders.LogicalElementBuilder;
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
@ContextConfiguration(initializers = RetrieveLogicalElementsIT.Initializer.class)
public class RetrieveLogicalElementsIT {

  static final PostgreSQLContainer postgreSQLContainer;
  static final LogicalElement logicalElement1;
  static final LogicalElement logicalElement2;
  static final LogicalElement logicalElement3;

  static {

    postgreSQLContainer =
        new PostgreSQLContainer("postgres:10.15")
            .withDatabaseName("test")
            .withUsername("postgres")
            .withPassword("postgres");

    postgreSQLContainer
        .withInitScript("init.sql")
        .start();

    logicalElement1 =
        new LogicalElementBuilder()
            .id(1L)
            .data("{\"contextId\":1,\"typeId\":1,\"no\":\"1\",\"name\":\"First Logical Element Name\",\"description\":\"First Logical Element Name\"}")
            .version(1)
            .build();

    logicalElement2 =
        new LogicalElementBuilder()
            .id(2L)
            .data("{\"contextId\":2,\"typeId\":2,\"no\":\"2\",\"name\":\"Second Logical Element Name\",\"description\":\"Second Logical Element Name\"}")
            .version(1)
            .build();

    logicalElement3 =
        new LogicalElementBuilder()
            .id(3L)
            .data("{\"contextId\":3,\"typeId\":3,\"no\":\"3\",\"name\":\"Third Logical Element Name\",\"description\":\"Third Logical Element Name\"}")
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
  public void Given_LogicalElementRecordsExist_When_GetAllWithNameFilter_Then_OnlyLogicalElementRecordsWithTheSpecifiedNameWillBeReturned() {

    webTestClient
        .get()
        .uri(uriBuilder ->
            uriBuilder
                .path("/api/v1/logical_elements")
                .queryParam("name", "{param1}")
                .build("Third Logical Element Name"))
        .exchange()
        .expectStatus().isOk()
        .expectBodyList(LogicalElement.class)
        .value(response -> {

              Collections.sort(response);

              Assertions.assertThat(response.get(0).getId()).isEqualTo(logicalElement3.getId());
              try {
                JSONAssert.assertEquals(logicalElement3.getData(), response.get(0).getData(), false);
              } catch (JSONException e) {
                throw new RuntimeException(e);
              }
              Assertions.assertThat(response.get(0).getVersion()).isEqualTo(1);


            }
        );
  }


  @Test
  public void Given_LogicalElementRecordsExist_When_GetAllWithNameFragmentFilter_Then_OnlyLogicalElementRecordsWithTheSpecifiedNameFragmentWillBeReturned() {

    webTestClient
        .get()
        .uri(uriBuilder ->
            uriBuilder
                .path("/api/v1/logical_elements")
                .queryParam("name_like", "{param1}")
                .build("Thi"))
        .exchange()
        .expectStatus().isOk()
        .expectBodyList(LogicalElement.class)
        .value(response -> {

              Collections.sort(response);

              Assertions.assertThat(response.get(0).getId()).isEqualTo(logicalElement3.getId());
              try {
                JSONAssert.assertEquals(logicalElement3.getData(), response.get(0).getData(), false);
              } catch (JSONException e) {
                throw new RuntimeException(e);
              }
              Assertions.assertThat(response.get(0).getVersion()).isEqualTo(1);


            }
        );
  }


  @Test
  public void Given_LogicalElementRecordsExist_When_GetAllWithoutFilters_Then_AllLogicalElementRecordsWillBeReturned() {

    webTestClient
        .get()
        .uri(uriBuilder ->
            uriBuilder
                .path("/api/v1/logical_elements")
                .build())
        .exchange()
        .expectStatus().isOk()
        .expectBodyList(LogicalElement.class)
        .value(response -> {

              Collections.sort(response);

              Assertions.assertThat(response.get(0).getId()).isEqualTo(logicalElement1.getId());
              try {
                JSONAssert.assertEquals(logicalElement1.getData(), response.get(0).getData(), false);
              } catch (JSONException e) {
                throw new RuntimeException(e);
              }
              Assertions.assertThat(response.get(0).getVersion()).isEqualTo(logicalElement1.getVersion());

              Assertions.assertThat(response.get(1).getId()).isEqualTo(logicalElement2.getId());
              try {
                JSONAssert.assertEquals(logicalElement2.getData(), response.get(1).getData(), false);
              } catch (JSONException e) {
                throw new RuntimeException(e);
              }
              Assertions.assertThat(response.get(1).getVersion()).isEqualTo(logicalElement2.getVersion());

              Assertions.assertThat(response.get(2).getId()).isEqualTo(logicalElement3.getId());
              try {
                JSONAssert.assertEquals(logicalElement3.getData(), response.get(2).getData(), false);
              } catch (JSONException e) {
                throw new RuntimeException(e);
              }
              Assertions.assertThat(response.get(2).getVersion()).isEqualTo(logicalElement3.getVersion());


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

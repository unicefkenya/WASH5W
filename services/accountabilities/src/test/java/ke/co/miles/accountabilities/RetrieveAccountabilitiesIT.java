/*
 * Copyright (C) 2021 Second Mile
 *
 * This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0.
 * If a copy of the MPL was not distributed with this file,
 * You can obtain one at http://mozilla.org/MPL/2.0/.
 */
package ke.co.miles.accountabilities;

import java.util.Collections;
import ke.co.miles.accountabilities.models.Accountability;
import ke.co.miles.accountabilities.util.builders.AccountabilityBuilder;
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
@ContextConfiguration(initializers = RetrieveAccountabilitiesIT.Initializer.class)
public class RetrieveAccountabilitiesIT {

  @Autowired
  WebTestClient webTestClient;

  static final PostgreSQLContainer postgreSQLContainer;
  static final Accountability accountability1;
  static final Accountability accountability2;
  static final Accountability accountability3;
  static final Accountability accountability4;
  static final Accountability accountability5;

  static {

    postgreSQLContainer =
        new PostgreSQLContainer("postgres:10.15")
            .withDatabaseName("test")
            .withUsername("postgres")
            .withPassword("postgres");

    postgreSQLContainer
        .withInitScript("init.sql")
        .start();

    accountability1 =
        new AccountabilityBuilder()
            .id(1L)
            .data(
                "{\"type\": {\"id\": 1}, \"commissioner\": {\"id\": 10, \"name\": \"Tenth\"}, \"responsible\": {\"id\": 100, \"name\": \"One Hundredth\"}}")
            .version(1)
            .build();

    accountability2 =
        new AccountabilityBuilder()
            .id(2L)
            .data(
                "{\"type\": {\"id\": 2}, \"commissioner\": {\"id\": 20, \"name\": \"Twentieth\"}, \"responsible\": {\"id\": 200, \"name\": \"Two Hundredth\"}}")
            .version(1)
            .build();

    accountability3 =
        new AccountabilityBuilder()
            .id(3L)
            .data(
                "{\"type\": {\"id\": 3}, \"commissioner\": {\"id\": 30, \"name\": \"Thirtieth\"}, \"responsible\": {\"id\": 300, \"name\": \"Three Hundredth\"}}")
            .version(1)
            .build();

    accountability4 =
        new AccountabilityBuilder()
            .id(4L)
            .data(
                "{\"type\": {\"id\": 3}, \"commissioner\": {\"id\": 300, \"name\": \"Three Hundredth\"}, \"responsible\": {\"id\": 3000, \"name\": \"Three Thousandth\"}}")
            .version(1)
            .build();

    accountability5 =
        new AccountabilityBuilder()
            .id(5L)
            .data(
                "{\"type\": {\"id\": 3}, \"commissioner\": {\"id\": 3000, \"name\": \"Three Thousandth\"}, \"responsible\": {\"id\": 30000, \"name\": \"Thirty Thousandth\"}}")
            .version(1)
            .build();
  }

  public static class Initializer implements
      ApplicationContextInitializer<ConfigurableApplicationContext> {

    @Override
    public void initialize(@NotNull ConfigurableApplicationContext configurableApplicationContext) {
      TestPropertyValues values = TestPropertyValues.of(
          "database.host=" + postgreSQLContainer.getHost(),
          "database.port=" + postgreSQLContainer.getFirstMappedPort(),
          "database.username=" + postgreSQLContainer.getUsername(),
          "database.password=" + postgreSQLContainer.getPassword()
      );
      values.applyTo(configurableApplicationContext);
    }
  }

  @AfterClass
  public static void shutdown() {

    postgreSQLContainer.stop();
  }

  @Test
  public void Given_AccountabilityRecordsExist_When_GetAllWithIdsFilter_Then_OnlyAccountabilityRecordsWithTheSpecifiedIdsWillBeReturned() {

    webTestClient
        .get()
        .uri(uriBuilder ->
            uriBuilder
                .path("/api/v1/accountabilities/test/all")
                .queryParam("ids", "{id1}", "{id2}")
                .build(accountability1.getId().toString(),
                    accountability3.getId().toString()))
        .exchange()
        .expectStatus().isOk()
        .expectBodyList(Accountability.class)
        .value(response -> {

              Collections.sort(response);

              Assertions.assertThat(response.get(0).getId()).isEqualTo(accountability1.getId());
              try {
                JSONAssert.assertEquals(accountability1.getData(), response.get(0).getData(),
                    false);
              } catch (JSONException e) {
                throw new RuntimeException(e);
              }
              Assertions.assertThat(response.get(0).getVersion())
                  .isEqualTo(accountability1.getVersion());

              Assertions.assertThat(response.get(1).getId()).isEqualTo(accountability3.getId());
              try {
                JSONAssert.assertEquals(accountability3.getData(), response.get(1).getData(),
                    false);
              } catch (JSONException e) {
                throw new RuntimeException(e);
              }
              Assertions.assertThat(response.get(1).getVersion())
                  .isEqualTo(accountability3.getVersion());

            }
        );
  }

  @Test
  public void Given_AccountabilityRecordsExist_When_GetAllWithHierarchyFilter_Then_OnlyAccountabilityRecordsWithTheSpecifiedHierarchyWillBeReturned() {

    webTestClient
        .get()
        .uri(uriBuilder ->
            uriBuilder
                .path("/api/v1/accountabilities/test/all")
                .queryParam("typeId", "{param1}")
                .build("3"))
        .exchange()
        .expectStatus().isOk()
        .expectBodyList(Accountability.class)
        .value(response -> {

              Collections.sort(response);

              Assertions.assertThat(response.get(0).getId()).isEqualTo(accountability3.getId());
              try {
                JSONAssert.assertEquals(accountability3.getData(), response.get(0).getData(),
                    false);
              } catch (JSONException e) {
                throw new RuntimeException(e);
              }
              Assertions.assertThat(response.get(0).getVersion())
                  .isEqualTo(accountability3.getVersion());

              Assertions.assertThat(response.get(1).getId()).isEqualTo(accountability4.getId());
              try {
                JSONAssert.assertEquals(accountability4.getData(), response.get(1).getData(),
                    false);
              } catch (JSONException e) {
                throw new RuntimeException(e);
              }
              Assertions.assertThat(response.get(1).getVersion())
                  .isEqualTo(accountability4.getVersion());

              Assertions.assertThat(response.get(2).getId()).isEqualTo(accountability5.getId());
              try {
                JSONAssert.assertEquals(accountability5.getData(), response.get(2).getData(),
                    false);
              } catch (JSONException e) {
                throw new RuntimeException(e);
              }
              Assertions.assertThat(response.get(2).getVersion())
                  .isEqualTo(accountability5.getVersion());


            }
        );
  }

  @Test
  public void Given_AccountabilityRecordsExist_When_GetAscendantsAccountabilitys_Then_OnlyAscendantAccountabilityRecordsWillBeReturned() {

    webTestClient
        .get()
        .uri(uriBuilder ->
            uriBuilder
                .path(
                    "/api/v1/accountabilities/{database}/ascendants/type/{type}/responsible/{responsible}")
                .queryParam("levelGT", "{levelGT}")
                .build("test", 3, 30000, 0))
        .exchange()
        .expectStatus().isOk()
        .expectBodyList(Accountability.class)
        .value(response -> {

              Assertions.assertThat(response.size()).isEqualTo(2);

              Assertions.assertThat(response.get(0).getId()).isEqualTo(accountability4.getId());
              try {
                JSONAssert.assertEquals(accountability4.getData(), response.get(0).getData(),
                    false);
              } catch (JSONException e) {
                throw new RuntimeException(e);
              }
              Assertions.assertThat(response.get(0).getVersion())
                  .isEqualTo(accountability4.getVersion());

              Assertions.assertThat(response.get(1).getId()).isEqualTo(accountability3.getId());
              try {
                JSONAssert.assertEquals(accountability3.getData(), response.get(1).getData(),
                    false);
              } catch (JSONException e) {
                throw new RuntimeException(e);
              }
              Assertions.assertThat(response.get(1).getVersion())
                  .isEqualTo(accountability3.getVersion());


            }
        );
  }

  @Test
  public void Given_AccountabilityRecordsExist_When_GetDescendantsAccountabilitys_Then_OnlyDescendantAccountabilityRecordsWillBeReturned() {

    webTestClient
        .get()
        .uri(uriBuilder ->
            uriBuilder
                .path(
                    "/api/v1/accountabilities/{database}/descendants/type/{type}/commissioner/{commissioner}")
                .queryParam("levelGT", "{levelGT}")
                .build("test", 3, 30, 0))
        .exchange()
        .expectStatus().isOk()
        .expectBodyList(Accountability.class)
        .value(response -> {

              Collections.sort(response);

              Assertions.assertThat(response.size()).isEqualTo(2);

              Assertions.assertThat(response.get(0).getId()).isEqualTo(accountability4.getId());
              try {
                JSONAssert.assertEquals(accountability4.getData(), response.get(0).getData(),
                    false);
              } catch (JSONException e) {
                throw new RuntimeException(e);
              }
              Assertions.assertThat(response.get(0).getVersion())
                  .isEqualTo(accountability4.getVersion());

              Assertions.assertThat(response.get(1).getId()).isEqualTo(accountability5.getId());
              try {
                JSONAssert.assertEquals(accountability5.getData(), response.get(1).getData(),
                    false);
              } catch (JSONException e) {
                throw new RuntimeException(e);
              }
              Assertions.assertThat(response.get(1).getVersion())
                  .isEqualTo(accountability5.getVersion());


            }
        );
  }

  @Test
  public void Given_AccountabilityRecordsExist_When_GetAllWithCommissionerFilter_Then_OnlyAccountabilityRecordsWithTheSpecifiedCommissionerWillBeReturned() {

    webTestClient
        .get()
        .uri(uriBuilder ->
            uriBuilder
                .path("/api/v1/accountabilities/test/all")
                .queryParam("commissionerId", "{param1}")
                .build("30"))
        .exchange()
        .expectStatus().isOk()
        .expectBodyList(Accountability.class)
        .value(response -> {

              Collections.sort(response);

              Assertions.assertThat(response.get(0).getId()).isEqualTo(accountability3.getId());
              try {
                JSONAssert.assertEquals(accountability3.getData(), response.get(0).getData(),
                    false);
              } catch (JSONException e) {
                throw new RuntimeException(e);
              }
              Assertions.assertThat(response.get(0).getVersion())
                  .isEqualTo(accountability3.getVersion());


            }
        );
  }

  @Test
  public void Given_AccountabilityRecordsExist_When_GetAllWithResponsibleFilter_Then_OnlyAccountabilityRecordsWithTheSpecifiedResponsibleWillBeReturned() {

    webTestClient
        .get()
        .uri(uriBuilder ->
            uriBuilder
                .path("/api/v1/accountabilities/test/all")
                .queryParam("responsibleId", "{param1}")
                .build("300"))
        .exchange()
        .expectStatus().isOk()
        .expectBodyList(Accountability.class)
        .value(response -> {

              Collections.sort(response);

              Assertions.assertThat(response.get(0).getId()).isEqualTo(accountability3.getId());
              try {
                JSONAssert.assertEquals(accountability3.getData(), response.get(0).getData(),
                    false);
              } catch (JSONException e) {
                throw new RuntimeException(e);
              }
              Assertions.assertThat(response.get(0).getVersion())
                  .isEqualTo(accountability3.getVersion());


            }
        );
  }

  @Test
  public void Given_AccountabilityRecordsExist_When_GetAllWithoutFilters_Then_AllAccountabilityRecordsWillBeReturned() {

    webTestClient
        .get()
        .uri(uriBuilder ->
            uriBuilder
                .path("/api/v1/accountabilities/test/all")
                .build())
        .exchange()
        .expectStatus().isOk()
        .expectBodyList(Accountability.class)
        .value(response -> {

              Collections.sort(response);

              Assertions.assertThat(response.get(0).getId()).isEqualTo(accountability1.getId());
              try {
                JSONAssert.assertEquals(accountability1.getData(), response.get(0).getData(),
                    false);
              } catch (JSONException e) {
                throw new RuntimeException(e);
              }
              Assertions.assertThat(response.get(0).getVersion())
                  .isEqualTo(accountability1.getVersion());

              Assertions.assertThat(response.get(1).getId()).isEqualTo(accountability2.getId());
              try {
                JSONAssert.assertEquals(accountability2.getData(), response.get(1).getData(),
                    false);
              } catch (JSONException e) {
                throw new RuntimeException(e);
              }
              Assertions.assertThat(response.get(1).getVersion())
                  .isEqualTo(accountability2.getVersion());

              Assertions.assertThat(response.get(2).getId()).isEqualTo(accountability3.getId());
              try {
                JSONAssert.assertEquals(accountability3.getData(), response.get(2).getData(),
                    false);
              } catch (JSONException e) {
                throw new RuntimeException(e);
              }
              Assertions.assertThat(response.get(2).getVersion())
                  .isEqualTo(accountability3.getVersion());

              Assertions.assertThat(response.get(3).getId()).isEqualTo(accountability4.getId());
              try {
                JSONAssert.assertEquals(accountability4.getData(), response.get(3).getData(),
                    false);
              } catch (JSONException e) {
                throw new RuntimeException(e);
              }
              Assertions.assertThat(response.get(3).getVersion())
                  .isEqualTo(accountability4.getVersion());

              Assertions.assertThat(response.get(4).getId()).isEqualTo(accountability5.getId());
              try {
                JSONAssert.assertEquals(accountability5.getData(), response.get(4).getData(),
                    false);
              } catch (JSONException e) {
                throw new RuntimeException(e);
              }
              Assertions.assertThat(response.get(4).getVersion())
                  .isEqualTo(accountability5.getVersion());

            }
        );
  }

  @Test
  public void Given_AccountabilityRecordsExist_When_GetTotalAccountabilityRecords_Then_TheTotalCountOfAccountabilityRecordsWillBeReturned() {

    webTestClient
        .get()
        .uri(uriBuilder ->
            uriBuilder
                .path("/api/v1/accountabilities/test/total")
                .build())
        .exchange()
        .expectStatus().isOk()
        .expectBody(Long.class)
        .value(response -> Assertions.assertThat(response).isEqualTo(5L));
  }


  @Test
  public void Given_AccountabilityRecordsExist_When_GetTotalAccountabilityRecordsCorrespondingToAFilter_Then_TheTotalCountOfFilteredAccountabilityRecordsWillBeReturned() {

    webTestClient
        .get()
        .uri(uriBuilder ->
            uriBuilder
                .path("/api/v1/accountabilities/test/total")
                .queryParam("typeId", "{param1}")
                .build("3"))
        .exchange()
        .expectStatus().isOk()
        .expectBody(Long.class)
        .value(response -> Assertions.assertThat(response).isEqualTo(3L));
  }

}

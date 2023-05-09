/*
 * Copyright (C) 2021 Second Mile
 *
 * This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0.
 * If a copy of the MPL was not distributed with this file,
 * You can obtain one at http://mozilla.org/MPL/2.0/.
 */
package ke.co.miles.accountabilitiestypes;

import java.util.Collections;
import ke.co.miles.accountabilitiestypes.models.AccountabilityType;
import ke.co.miles.accountabilitiestypes.util.builders.AccountabilityTypeBuilder;
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
@ContextConfiguration(initializers = RetrieveAccountabilitiesTypesIT.Initializer.class)
public class RetrieveAccountabilitiesTypesIT {

  @Autowired
  WebTestClient webTestClient;

  static final PostgreSQLContainer postgreSQLContainer;
  static final AccountabilityType accountabilityType1;
  static final AccountabilityType accountabilityType2;
  static final AccountabilityType accountabilityType3;
  static final AccountabilityType accountabilityType4;
  static final AccountabilityType accountabilityType5;

  static {

    postgreSQLContainer =
        new PostgreSQLContainer("postgres:10.15")
            .withDatabaseName("test")
            .withUsername("postgres")
            .withPassword("postgres");

    postgreSQLContainer
        .withInitScript("init.sql")
        .start();

    accountabilityType1 =
        new AccountabilityTypeBuilder()
            .id(1L)
            .data(
                "{\"hierarchy\": {\"id\": 1}, \"commissioner\": {\"id\": 10, \"name\": \"Tenth\"}, \"responsible\": {\"id\": 100, \"name\": \"One Hundredth\"}}")
            .version(1)
            .build();

    accountabilityType2 =
        new AccountabilityTypeBuilder()
            .id(2L)
            .data(
                "{\"hierarchy\": {\"id\": 2}, \"commissioner\": {\"id\": 20, \"name\": \"Twentieth\"}, \"responsible\": {\"id\": 200, \"name\": \"Two Hundredth\"}}")
            .version(1)
            .build();

    accountabilityType3 =
        new AccountabilityTypeBuilder()
            .id(3L)
            .data(
                "{\"hierarchy\": {\"id\": 3}, \"commissioner\": {\"id\": 30, \"name\": \"Thirtieth\"}, \"responsible\": {\"id\": 300, \"name\": \"Three Hundredth\"}}")
            .version(1)
            .build();

    accountabilityType4 =
        new AccountabilityTypeBuilder()
            .id(4L)
            .data(
                "{\"hierarchy\": {\"id\": 3}, \"commissioner\": {\"id\": 300, \"name\": \"Three Hundredth\"}, \"responsible\": {\"id\": 3000, \"name\": \"Three Thousandth\"}}")
            .version(1)
            .build();

    accountabilityType5 =
        new AccountabilityTypeBuilder()
            .id(5L)
            .data(
                "{\"hierarchy\": {\"id\": 3}, \"commissioner\": {\"id\": 3000, \"name\": \"Three Thousandth\"}, \"responsible\": {\"id\": 30000, \"name\": \"Thirty Thousandth\"}}")
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
  public void Given_AccountabilityTypeRecordsExist_When_GetAllWithIdsFilter_Then_OnlyAccountabilityTypeRecordsWithTheSpecifiedIdsWillBeReturned() {

    webTestClient
        .get()
        .uri(uriBuilder ->
            uriBuilder
                .path("/api/v1/accountabilities_types/test/all")
                .queryParam("ids", "{id1}", "{id2}")
                .build(accountabilityType1.getId().toString(),
                    accountabilityType3.getId().toString()))
        .exchange()
        .expectStatus().isOk()
        .expectBodyList(AccountabilityType.class)
        .value(response -> {

              Collections.sort(response);

              Assertions.assertThat(response.get(0).getId()).isEqualTo(accountabilityType1.getId());
              try {
                JSONAssert.assertEquals(accountabilityType1.getData(), response.get(0).getData(),
                    false);
              } catch (JSONException e) {
                throw new RuntimeException(e);
              }
              Assertions.assertThat(response.get(0).getVersion())
                  .isEqualTo(accountabilityType1.getVersion());

              Assertions.assertThat(response.get(1).getId()).isEqualTo(accountabilityType3.getId());
              try {
                JSONAssert.assertEquals(accountabilityType3.getData(), response.get(1).getData(),
                    false);
              } catch (JSONException e) {
                throw new RuntimeException(e);
              }
              Assertions.assertThat(response.get(1).getVersion())
                  .isEqualTo(accountabilityType3.getVersion());

            }
        );
  }

  @Test
  public void Given_AccountabilityTypeRecordsExist_When_GetAllWithHierarchyFilter_Then_OnlyAccountabilityTypeRecordsWithTheSpecifiedHierarchyWillBeReturned() {

    webTestClient
        .get()
        .uri(uriBuilder ->
            uriBuilder
                .path("/api/v1/accountabilities_types/test/all")
                .queryParam("hierarchyId", "{param1}")
                .build("3"))
        .exchange()
        .expectStatus().isOk()
        .expectBodyList(AccountabilityType.class)
        .value(response -> {

              Collections.sort(response);

              Assertions.assertThat(response.get(0).getId()).isEqualTo(accountabilityType3.getId());
              try {
                JSONAssert.assertEquals(accountabilityType3.getData(), response.get(0).getData(),
                    false);
              } catch (JSONException e) {
                throw new RuntimeException(e);
              }
              Assertions.assertThat(response.get(0).getVersion())
                  .isEqualTo(accountabilityType3.getVersion());

              Assertions.assertThat(response.get(1).getId()).isEqualTo(accountabilityType4.getId());
              try {
                JSONAssert.assertEquals(accountabilityType4.getData(), response.get(1).getData(),
                    false);
              } catch (JSONException e) {
                throw new RuntimeException(e);
              }
              Assertions.assertThat(response.get(1).getVersion())
                  .isEqualTo(accountabilityType4.getVersion());

              Assertions.assertThat(response.get(2).getId()).isEqualTo(accountabilityType5.getId());
              try {
                JSONAssert.assertEquals(accountabilityType5.getData(), response.get(2).getData(),
                    false);
              } catch (JSONException e) {
                throw new RuntimeException(e);
              }
              Assertions.assertThat(response.get(2).getVersion())
                  .isEqualTo(accountabilityType5.getVersion());


            }
        );
  }

  @Test
  public void Given_AccountabilityTypeRecordsExist_When_GetAscendantsAccountabilityTypes_Then_OnlyAscendantAccountabilityTypeRecordsWillBeReturned() {

    webTestClient
        .get()
        .uri(uriBuilder ->
            uriBuilder
                .path(
                    "/api/v1/accountabilities_types/{database}/ascendants/hierarchy/{hierarchy}/responsible/{responsible}")
                .queryParam("levelGT", "{levelGT}")
                .build("test", 3, 30000, 0))
        .exchange()
        .expectStatus().isOk()
        .expectBodyList(AccountabilityType.class)
        .value(response -> {

              Assertions.assertThat(response.size()).isEqualTo(2);

              Assertions.assertThat(response.get(0).getId()).isEqualTo(accountabilityType4.getId());
              try {
                JSONAssert.assertEquals(accountabilityType4.getData(), response.get(0).getData(),
                    false);
              } catch (JSONException e) {
                throw new RuntimeException(e);
              }
              Assertions.assertThat(response.get(0).getVersion())
                  .isEqualTo(accountabilityType4.getVersion());

              Assertions.assertThat(response.get(1).getId()).isEqualTo(accountabilityType3.getId());
              try {
                JSONAssert.assertEquals(accountabilityType3.getData(), response.get(1).getData(),
                    false);
              } catch (JSONException e) {
                throw new RuntimeException(e);
              }
              Assertions.assertThat(response.get(1).getVersion())
                  .isEqualTo(accountabilityType3.getVersion());


            }
        );
  }

  @Test
  public void Given_AccountabilityTypeRecordsExist_When_GetDescendantsAccountabilityTypes_Then_OnlyDescendantAccountabilityTypeRecordsWillBeReturned() {

    webTestClient
        .get()
        .uri(uriBuilder ->
            uriBuilder
                .path(
                    "/api/v1/accountabilities_types/{database}/descendants/hierarchy/{hierarchy}/commissioner/{commissioner}")
                .queryParam("levelGT", "{levelGT}")
                .build("test", 3, 30, 0))
        .exchange()
        .expectStatus().isOk()
        .expectBodyList(AccountabilityType.class)
        .value(response -> {

              Collections.sort(response);

              Assertions.assertThat(response.size()).isEqualTo(2);

              Assertions.assertThat(response.get(0).getId()).isEqualTo(accountabilityType4.getId());
              try {
                JSONAssert.assertEquals(accountabilityType4.getData(), response.get(0).getData(),
                    false);
              } catch (JSONException e) {
                throw new RuntimeException(e);
              }
              Assertions.assertThat(response.get(0).getVersion())
                  .isEqualTo(accountabilityType4.getVersion());

              Assertions.assertThat(response.get(1).getId()).isEqualTo(accountabilityType5.getId());
              try {
                JSONAssert.assertEquals(accountabilityType5.getData(), response.get(1).getData(),
                    false);
              } catch (JSONException e) {
                throw new RuntimeException(e);
              }
              Assertions.assertThat(response.get(1).getVersion())
                  .isEqualTo(accountabilityType5.getVersion());


            }
        );
  }

  @Test
  public void Given_AccountabilityTypeRecordsExist_When_GetAllWithCommissionerFilter_Then_OnlyAccountabilityTypeRecordsWithTheSpecifiedCommissionerWillBeReturned() {

    webTestClient
        .get()
        .uri(uriBuilder ->
            uriBuilder
                .path("/api/v1/accountabilities_types/test/all")
                .queryParam("commissionerId", "{param1}")
                .build("30"))
        .exchange()
        .expectStatus().isOk()
        .expectBodyList(AccountabilityType.class)
        .value(response -> {

              Collections.sort(response);

              Assertions.assertThat(response.get(0).getId()).isEqualTo(accountabilityType3.getId());
              try {
                JSONAssert.assertEquals(accountabilityType3.getData(), response.get(0).getData(),
                    false);
              } catch (JSONException e) {
                throw new RuntimeException(e);
              }
              Assertions.assertThat(response.get(0).getVersion())
                  .isEqualTo(accountabilityType3.getVersion());


            }
        );
  }

  @Test
  public void Given_AccountabilityTypeRecordsExist_When_GetAllWithResponsibleFilter_Then_OnlyAccountabilityTypeRecordsWithTheSpecifiedResponsibleWillBeReturned() {

    webTestClient
        .get()
        .uri(uriBuilder ->
            uriBuilder
                .path("/api/v1/accountabilities_types/test/all")
                .queryParam("responsibleId", "{param1}")
                .build("300"))
        .exchange()
        .expectStatus().isOk()
        .expectBodyList(AccountabilityType.class)
        .value(response -> {

              Collections.sort(response);

              Assertions.assertThat(response.get(0).getId()).isEqualTo(accountabilityType3.getId());
              try {
                JSONAssert.assertEquals(accountabilityType3.getData(), response.get(0).getData(),
                    false);
              } catch (JSONException e) {
                throw new RuntimeException(e);
              }
              Assertions.assertThat(response.get(0).getVersion())
                  .isEqualTo(accountabilityType3.getVersion());


            }
        );
  }

  @Test
  public void Given_AccountabilityTypeRecordsExist_When_GetAllWithoutFilters_Then_AllAccountabilityTypeRecordsWillBeReturned() {

    webTestClient
        .get()
        .uri(uriBuilder ->
            uriBuilder
                .path("/api/v1/accountabilities_types/test/all")
                .build())
        .exchange()
        .expectStatus().isOk()
        .expectBodyList(AccountabilityType.class)
        .value(response -> {

              Collections.sort(response);

              Assertions.assertThat(response.get(0).getId()).isEqualTo(accountabilityType1.getId());
              try {
                JSONAssert.assertEquals(accountabilityType1.getData(), response.get(0).getData(),
                    false);
              } catch (JSONException e) {
                throw new RuntimeException(e);
              }
              Assertions.assertThat(response.get(0).getVersion())
                  .isEqualTo(accountabilityType1.getVersion());

              Assertions.assertThat(response.get(1).getId()).isEqualTo(accountabilityType2.getId());
              try {
                JSONAssert.assertEquals(accountabilityType2.getData(), response.get(1).getData(),
                    false);
              } catch (JSONException e) {
                throw new RuntimeException(e);
              }
              Assertions.assertThat(response.get(1).getVersion())
                  .isEqualTo(accountabilityType2.getVersion());

              Assertions.assertThat(response.get(2).getId()).isEqualTo(accountabilityType3.getId());
              try {
                JSONAssert.assertEquals(accountabilityType3.getData(), response.get(2).getData(),
                    false);
              } catch (JSONException e) {
                throw new RuntimeException(e);
              }
              Assertions.assertThat(response.get(2).getVersion())
                  .isEqualTo(accountabilityType3.getVersion());

              Assertions.assertThat(response.get(3).getId()).isEqualTo(accountabilityType4.getId());
              try {
                JSONAssert.assertEquals(accountabilityType4.getData(), response.get(3).getData(),
                    false);
              } catch (JSONException e) {
                throw new RuntimeException(e);
              }
              Assertions.assertThat(response.get(3).getVersion())
                  .isEqualTo(accountabilityType4.getVersion());

              Assertions.assertThat(response.get(4).getId()).isEqualTo(accountabilityType5.getId());
              try {
                JSONAssert.assertEquals(accountabilityType5.getData(), response.get(4).getData(),
                    false);
              } catch (JSONException e) {
                throw new RuntimeException(e);
              }
              Assertions.assertThat(response.get(4).getVersion())
                  .isEqualTo(accountabilityType5.getVersion());

            }
        );
  }

  @Test
  public void Given_AccountabilityTypeRecordsExist_When_GetTotalAccountabilityTypeRecords_Then_TheTotalCountOfAccountabilityTypeRecordsWillBeReturned() {

    webTestClient
        .get()
        .uri(uriBuilder ->
            uriBuilder
                .path("/api/v1/accountabilities_types/test/total")
                .build())
        .exchange()
        .expectStatus().isOk()
        .expectBody(Long.class)
        .value(response -> Assertions.assertThat(response).isEqualTo(5L));
  }


  @Test
  public void Given_AccountabilityTypeRecordsExist_When_GetTotalAccountabilityTypeRecordsCorrespondingToAFilter_Then_TheTotalCountOfFilteredAccountabilityTypeRecordsWillBeReturned() {

    webTestClient
        .get()
        .uri(uriBuilder ->
            uriBuilder
                .path("/api/v1/accountabilities_types/test/total")
                .queryParam("hierarchyId", "{param1}")
                .build("3"))
        .exchange()
        .expectStatus().isOk()
        .expectBody(Long.class)
        .value(response -> Assertions.assertThat(response).isEqualTo(3L));
  }

}

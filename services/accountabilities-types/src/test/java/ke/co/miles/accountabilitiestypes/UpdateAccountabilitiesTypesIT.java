/*
 * Copyright (C) 2021 Second Mile
 *
 * This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0.
 * If a copy of the MPL was not distributed with this file,
 * You can obtain one at http://mozilla.org/MPL/2.0/.
 */
package ke.co.miles.accountabilitiestypes;

import java.util.Arrays;
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
import org.springframework.http.MediaType;
import org.springframework.test.context.ContextConfiguration;
import org.springframework.test.web.reactive.server.WebTestClient;
import org.testcontainers.containers.PostgreSQLContainer;
import org.testcontainers.junit.jupiter.Testcontainers;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

/**
 * @author Kwaje Anthony <tony@miles.co.ke>
 * @version 1.0
 * @since 1.0
 */
@Testcontainers
@SpringBootTest(webEnvironment = WebEnvironment.RANDOM_PORT)
@AutoConfigureWebTestClient
@ContextConfiguration(initializers = UpdateAccountabilitiesTypesIT.Initializer.class)
public class UpdateAccountabilitiesTypesIT {

  @Autowired
  WebTestClient webTestClient;

  static final PostgreSQLContainer postgreSQLContainer;

  static final AccountabilityType accountabilityType1;

  static final AccountabilityType accountabilityType2;

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
                "{\"hierarchy\": {\"id\": 10}, \"commissioner\": {\"id\": 100, \"name\": \"Hundredth\"}, \"responsible\": {\"id\": 1000, \"name\": \"Thousandth\"}}")
            .version(1)
            .build();

    accountabilityType2 =
        new AccountabilityTypeBuilder()
            .id(2L)
            .data(
                "{\"hierarchy\": {\"id\": 20}, \"commissioner\": {\"id\": 200, \"name\": \"Two Hundredth\"}, \"responsible\": {\"id\": 2000, \"name\": \"Two Thousandth\"}}")
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
  public void Given_ModifiedDetailsOfExistingRecords_When_PutAll_Then_TheRecordsWillBeUpdatedAndReturnedWithTheirVersionsIncrementedByOne() {

    webTestClient
        .put()
        .uri("/api/v1/accountabilities_types/test/all")
        .contentType(MediaType.APPLICATION_JSON)
        .body(Flux.fromIterable(Arrays.asList(accountabilityType1, accountabilityType2)),
            AccountabilityType.class)
        .exchange()
        .expectStatus()
        .isOk()
        .expectBodyList(AccountabilityType.class)
        .value(response -> {

              Assertions.assertThat(response.size()).isEqualTo(2);

              Collections.sort(response);

              Assertions.assertThat(response.get(0).getId()).isEqualTo(1L);
              try {
                JSONAssert.assertEquals(accountabilityType1.getData(), response.get(0).getData(),
                    false);
              } catch (JSONException e) {
                throw new RuntimeException(e);
              }
              Assertions.assertThat(response.get(0).getVersion())
                  .isEqualTo(accountabilityType1.getVersion() + 1);

              Assertions.assertThat(response.get(1).getId()).isEqualTo(2L);
              try {
                JSONAssert.assertEquals(accountabilityType2.getData(), response.get(1).getData(),
                    false);
              } catch (JSONException e) {
                throw new RuntimeException(e);
              }
              Assertions.assertThat(response.get(1).getVersion())
                  .isEqualTo(accountabilityType2.getVersion() + 1);

            }
        );
  }

  @Test
  public void Given_ModifiedEntityName_When_PutName_Then_AllRecordsReferencingTheOldNameWillBeUpdatedAndTheTotalCountOfUpdatesReturned() {

    webTestClient
        .put()
        .uri(uriBuilder ->
            uriBuilder
                .path(
                    "/api/v1/accountabilities_types/{database}/entity/{entityId}/name")
                .build("test", 300))
        .contentType(MediaType.APPLICATION_JSON)
        .body(Mono.just("3 Hundredth"), String.class)
        .exchange()
        .expectStatus()
        .isOk()
        .expectBody(Integer.class)
        .isEqualTo(2);
  }
}

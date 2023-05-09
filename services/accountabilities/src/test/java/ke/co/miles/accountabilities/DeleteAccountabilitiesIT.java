/*
 * Copyright (C) 2021 Second Mile
 *
 * This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0.
 * If a copy of the MPL was not distributed with this file,
 * You can obtain one at http://mozilla.org/MPL/2.0/.
 */
package ke.co.miles.accountabilities;

import org.jetbrains.annotations.NotNull;
import org.junit.AfterClass;
import org.junit.jupiter.api.MethodOrderer;
import org.junit.jupiter.api.Order;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.TestMethodOrder;
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
@ContextConfiguration(initializers = DeleteAccountabilitiesIT.Initializer.class)
@TestMethodOrder(MethodOrderer.OrderAnnotation.class)
public class DeleteAccountabilitiesIT {

  @Autowired
  WebTestClient webTestClient;

  static final PostgreSQLContainer postgreSQLContainer;

  static {

    postgreSQLContainer =
        new PostgreSQLContainer("postgres:10.15")
            .withDatabaseName("test")
            .withUsername("postgres")
            .withPassword("postgres");

    postgreSQLContainer
        .withInitScript("init.sql")
        .start();
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
  @Order(1)
  public void Given_AccountabilityRecordsExist_When_DeleteAllWithIdsFilter_Then_AccountabilityRecordsWithIdsWillBeDeletedAndATotalCountOfAffectedRecordsReturned() {

    long id1 = 1L;
    long id2 = 2L;

    webTestClient
        .delete()
        .uri(uriBuilder ->
            uriBuilder
                .path("/api/v1/accountabilities/test/all")
                .queryParam("ids", "{id1}", "{id2}")
                .build(Long.toString(id1), Long.toString(id2)))
        .exchange()
        .expectStatus().isOk()
        .expectBody(Integer.class)
        .isEqualTo(2);
  }

  @Test
  @Order(2)
  public void Given_AccountabilityRecordsExist_When_DeleteAllWithoutFilters_Then_AllAccountabilityRecordsWillBeDeletedAndATotalCountOfAffectedRecordsReturned() {

    webTestClient
        .delete()
        .uri("/api/v1/accountabilities/test/all")
        .exchange()
        .expectStatus().isOk()
        .expectBody(Integer.class)
        .isEqualTo(3);
  }


}

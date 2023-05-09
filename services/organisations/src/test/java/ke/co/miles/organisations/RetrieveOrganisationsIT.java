/*
 * Copyright (C) 2021 Second Mile
 *
 * This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0.
 * If a copy of the MPL was not distributed with this file,
 * You can obtain one at http://mozilla.org/MPL/2.0/.
 */
package ke.co.miles.organisations;

import java.util.Collections;
import ke.co.miles.organisations.models.Organisation;
import ke.co.miles.organisations.util.builders.OrganisationBuilder;
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
@ContextConfiguration(initializers = RetrieveOrganisationsIT.Initializer.class)
public class RetrieveOrganisationsIT {

  static final PostgreSQLContainer postgreSQLContainer;
  static final Organisation organisation1;
  static final Organisation organisation2;
  static final Organisation organisation3;

  static {

    postgreSQLContainer =
        new PostgreSQLContainer("postgres:10.15")
            .withDatabaseName("test")
            .withUsername("postgres")
            .withPassword("postgres");

    postgreSQLContainer
        .withInitScript("init.sql")
        .start();

    organisation1 =
        new OrganisationBuilder()
            .id(1L)
            .data(
                "{\"typeId\":1,\"name\":\"First Organisation Name\",\"abbreviation\":\"FON\",\"website\":\"www.firstOrganisationName.com\"}")
            .version(1)
            .build();

    organisation2 =
        new OrganisationBuilder()
            .id(2L)
            .data(
                    "{\"typeId\":2,\"name\":\"Second Organisation Name\",\"abbreviation\":\"SON\",\"website\":\"www.secondOrganisationName.com\"}")
            .version(1)
            .build();

    organisation3 =
        new OrganisationBuilder()
            .id(3L)
            .data(
                    "{\"typeId\":3,\"name\":\"Third Organisation Name\",\"abbreviation\":\"TON\",\"website\":\"www.thirdOrganisationName.com\"}")
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
  public void Given_OrganisationRecordsExist_When_GetAllWithNameFilter_Then_OnlyOrganisationRecordsWithTheSpecifiedNameWillBeReturned() {

    webTestClient
        .get()
        .uri(uriBuilder ->
            uriBuilder
                .path("/api/v1/organisations")
                .queryParam("name", "{param1}")
                .build("Third Organisation Name"))
        .exchange()
        .expectStatus().isOk()
        .expectBodyList(Organisation.class)
        .value(response -> {

              Collections.sort(response);

              Assertions.assertThat(response.get(0).getId()).isEqualTo(organisation3.getId());
              try {
                JSONAssert.assertEquals(organisation3.getData(), response.get(0).getData(), false);
              } catch (JSONException e) {
                throw new RuntimeException(e);
              }
              Assertions.assertThat(response.get(0).getVersion()).isEqualTo(1);


            }
        );
  }


  @Test
  public void Given_OrganisationRecordsExist_When_GetAllWithNameFragmentFilter_Then_OnlyOrganisationRecordsWithTheSpecifiedNameFragmentWillBeReturned() {

    webTestClient
        .get()
        .uri(uriBuilder ->
            uriBuilder
                .path("/api/v1/organisations")
                .queryParam("name_like", "{param1}")
                .build("Thi"))
        .exchange()
        .expectStatus().isOk()
        .expectBodyList(Organisation.class)
        .value(response -> {

              Collections.sort(response);

              Assertions.assertThat(response.get(0).getId()).isEqualTo(organisation3.getId());
              try {
                JSONAssert.assertEquals(organisation3.getData(), response.get(0).getData(), false);
              } catch (JSONException e) {
                throw new RuntimeException(e);
              }
              Assertions.assertThat(response.get(0).getVersion()).isEqualTo(1);


            }
        );
  }

  @Test
  public void Given_OrganisationRecordsExist_When_GetAllWithoutFilters_Then_AllOrganisationRecordsWillBeReturned() {

    webTestClient
        .get()
        .uri(uriBuilder ->
            uriBuilder
                .path("/api/v1/organisations")
                .build())
        .exchange()
        .expectStatus().isOk()
        .expectBodyList(Organisation.class)
        .value(response -> {

              Collections.sort(response);

              Assertions.assertThat(response.get(0).getId()).isEqualTo(organisation1.getId());
              try {
                JSONAssert.assertEquals(organisation1.getData(), response.get(0).getData(), false);
              } catch (JSONException e) {
                throw new RuntimeException(e);
              }
              Assertions.assertThat(response.get(0).getVersion()).isEqualTo(organisation1.getVersion());

              Assertions.assertThat(response.get(1).getId()).isEqualTo(organisation2.getId());
              try {
                JSONAssert.assertEquals(organisation2.getData(), response.get(1).getData(), false);
              } catch (JSONException e) {
                throw new RuntimeException(e);
              }
              Assertions.assertThat(response.get(1).getVersion()).isEqualTo(organisation2.getVersion());

              Assertions.assertThat(response.get(2).getId()).isEqualTo(organisation3.getId());
              try {
                JSONAssert.assertEquals(organisation3.getData(), response.get(2).getData(), false);
              } catch (JSONException e) {
                throw new RuntimeException(e);
              }
              Assertions.assertThat(response.get(2).getVersion()).isEqualTo(organisation3.getVersion());


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

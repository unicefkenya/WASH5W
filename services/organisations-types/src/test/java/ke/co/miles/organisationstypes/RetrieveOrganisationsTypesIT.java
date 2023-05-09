/*
 * Copyright (C) 2021 Second Mile
 *
 * This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0.
 * If a copy of the MPL was not distributed with this file,
 * You can obtain one at http://mozilla.org/MPL/2.0/.
 */
package ke.co.miles.organisationstypes;

import java.util.Collections;
import ke.co.miles.organisationstypes.models.OrganisationType;
import ke.co.miles.organisationstypes.util.builders.OrganisationTypeBuilder;
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
@ContextConfiguration(initializers = RetrieveOrganisationsTypesIT.Initializer.class)
public class RetrieveOrganisationsTypesIT {

  static final PostgreSQLContainer postgreSQLContainer;
  static final OrganisationType organisationType1;
  static final OrganisationType organisationType2;
  static final OrganisationType organisationType3;

  static {

    postgreSQLContainer =
        new PostgreSQLContainer("postgres:10.15")
            .withDatabaseName("test")
            .withUsername("postgres")
            .withPassword("postgres");

    postgreSQLContainer
        .withInitScript("init.sql")
        .start();

    organisationType1 =
        new OrganisationTypeBuilder()
            .id(1L)
            .data(
                "{\"name\":\"First Organisation Type Name\",\"plural\":\"First Organisation Type Names\",\"abbreviation\":\"FOTN\",\"colourCode\":\"#ff0000\"}")
            .version(1)
            .build();

    organisationType2 =
        new OrganisationTypeBuilder()
            .id(2L)
            .data(
                "{\"name\":\"Second Organisation Type Name\",\"plural\":\"Second Organisation Type Names\",\"abbreviation\":\"SOTN\",\"colourCode\":\"#ff0000\"}")
            .version(1)
            .build();

    organisationType3 =
        new OrganisationTypeBuilder()
            .id(3L)
            .data(
                "{\"name\":\"Third Organisation Type Name\",\"plural\":\"Third Organisation Type Names\",\"abbreviation\":\"TOTN\",\"colourCode\":\"#ff0000\"}")
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
  public void Given_OrganisationTypeRecordsExist_When_GetAllWithNameFilter_Then_OnlyOrganisationTypeRecordsWithTheSpecifiedNameWillBeReturned() {

    webTestClient
        .get()
        .uri(uriBuilder ->
            uriBuilder
                .path("/api/v1/organisations_types")
                .queryParam("name", "{param1}")
                .build("Third Organisation Type Name"))
        .exchange()
        .expectStatus().isOk()
        .expectBodyList(OrganisationType.class)
        .value(response -> {

              Collections.sort(response);

              Assertions.assertThat(response.get(0).getId()).isEqualTo(organisationType3.getId());
              try {
                JSONAssert.assertEquals(organisationType3.getData(), response.get(0).getData(), false);
              } catch (JSONException e) {
                throw new RuntimeException(e);
              }
              Assertions.assertThat(response.get(0).getVersion()).isEqualTo(1);


            }
        );
  }


  @Test
  public void Given_OrganisationTypeRecordsExist_When_GetAllWithNameFragmentFilter_Then_OnlyOrganisationTypeRecordsWithTheSpecifiedNameFragmentWillBeReturned() {

    webTestClient
        .get()
        .uri(uriBuilder ->
            uriBuilder
                .path("/api/v1/organisations_types")
                .queryParam("name_like", "{param1}")
                .build("Thi"))
        .exchange()
        .expectStatus().isOk()
        .expectBodyList(OrganisationType.class)
        .value(response -> {

              Collections.sort(response);

              Assertions.assertThat(response.get(0).getId()).isEqualTo(organisationType3.getId());
              try {
                JSONAssert.assertEquals(organisationType3.getData(), response.get(0).getData(), false);
              } catch (JSONException e) {
                throw new RuntimeException(e);
              }
              Assertions.assertThat(response.get(0).getVersion()).isEqualTo(1);


            }
        );
  }

  @Test
  public void Given_OrganisationTypeRecordsExist_When_GetAllWithoutFilters_Then_AllOrganisationTypeRecordsWillBeReturned() {

    webTestClient
        .get()
        .uri(uriBuilder ->
            uriBuilder
                .path("/api/v1/organisations_types")
                .build())
        .exchange()
        .expectStatus().isOk()
        .expectBodyList(OrganisationType.class)
        .value(response -> {

              Collections.sort(response);

              Assertions.assertThat(response.get(0).getId()).isEqualTo(organisationType1.getId());
              try {
                JSONAssert.assertEquals(organisationType1.getData(), response.get(0).getData(), false);
              } catch (JSONException e) {
                throw new RuntimeException(e);
              }
              Assertions.assertThat(response.get(0).getVersion()).isEqualTo(organisationType1.getVersion());

              Assertions.assertThat(response.get(1).getId()).isEqualTo(organisationType2.getId());
              try {
                JSONAssert.assertEquals(organisationType2.getData(), response.get(1).getData(), false);
              } catch (JSONException e) {
                throw new RuntimeException(e);
              }
              Assertions.assertThat(response.get(1).getVersion()).isEqualTo(organisationType2.getVersion());

              Assertions.assertThat(response.get(2).getId()).isEqualTo(organisationType3.getId());
              try {
                JSONAssert.assertEquals(organisationType3.getData(), response.get(2).getData(), false);
              } catch (JSONException e) {
                throw new RuntimeException(e);
              }
              Assertions.assertThat(response.get(2).getVersion()).isEqualTo(organisationType3.getVersion());


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

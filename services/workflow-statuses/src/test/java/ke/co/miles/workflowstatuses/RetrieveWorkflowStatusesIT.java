/*
 * Copyright (C) 2021 Second Mile
 *
 * This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0.
 * If a copy of the MPL was not distributed with this file,
 * You can obtain one at http://mozilla.org/MPL/2.0/.
 */
package ke.co.miles.workflowstatuses;

import java.util.Collections;
import ke.co.miles.workflowstatuses.models.WorkflowStatus;
import ke.co.miles.workflowstatuses.util.builders.WorkflowStatusBuilder;
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
@ContextConfiguration(initializers = RetrieveWorkflowStatusesIT.Initializer.class)
public class RetrieveWorkflowStatusesIT {

  static final PostgreSQLContainer postgreSQLContainer;
  static final WorkflowStatus workflowStatus1;
  static final WorkflowStatus workflowStatus2;
  static final WorkflowStatus workflowStatus3;

  static {

    postgreSQLContainer =
        new PostgreSQLContainer("postgres:10.15")
            .withDatabaseName("test")
            .withUsername("postgres")
            .withPassword("postgres");

    postgreSQLContainer
        .withInitScript("init.sql")
        .start();

    workflowStatus1 =
        new WorkflowStatusBuilder()
            .id(1L)
            .data("{\"name\":\"First Workflow Status Name\"}")
            .version(1)
            .build();

    workflowStatus2 =
        new WorkflowStatusBuilder()
            .id(2L)
            .data("{\"name\":\"Second Workflow Status Name\"}")
            .version(1)
            .build();

    workflowStatus3 =
        new WorkflowStatusBuilder()
            .id(3L)
            .data("{\"name\":\"Third Workflow Status Name\"}")
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
  public void Given_WorkflowStatusRecordsExist_When_GetAllWithNameFilter_Then_OnlyWorkflowStatusRecordsWithTheSpecifiedNameWillBeReturned() {

    webTestClient
        .get()
        .uri(uriBuilder ->
            uriBuilder
                .path("/api/v1/workflow_statuses")
                .queryParam("name", "{param1}")
                .build("Third Workflow Status Name"))
        .exchange()
        .expectStatus().isOk()
        .expectBodyList(WorkflowStatus.class)
        .value(response -> {

              Collections.sort(response);

              Assertions.assertThat(response.get(0).getId()).isEqualTo(workflowStatus3.getId());
              try {
                JSONAssert.assertEquals(workflowStatus3.getData(), response.get(0).getData(), false);
              } catch (JSONException e) {
                throw new RuntimeException(e);
              }
              Assertions.assertThat(response.get(0).getVersion()).isEqualTo(1);


            }
        );
  }


  @Test
  public void Given_WorkflowStatusRecordsExist_When_GetAllWithNameFragmentFilter_Then_OnlyWorkflowStatusRecordsWithTheSpecifiedNameFragmentWillBeReturned() {

    webTestClient
        .get()
        .uri(uriBuilder ->
            uriBuilder
                .path("/api/v1/workflow_statuses")
                .queryParam("name_like", "{param1}")
                .build("Thi"))
        .exchange()
        .expectStatus().isOk()
        .expectBodyList(WorkflowStatus.class)
        .value(response -> {

              Collections.sort(response);

              Assertions.assertThat(response.get(0).getId()).isEqualTo(workflowStatus3.getId());
              try {
                JSONAssert.assertEquals(workflowStatus3.getData(), response.get(0).getData(), false);
              } catch (JSONException e) {
                throw new RuntimeException(e);
              }
              Assertions.assertThat(response.get(0).getVersion()).isEqualTo(1);


            }
        );
  }


  @Test
  public void Given_WorkflowStatusRecordsExist_When_GetAllWithoutFilters_Then_AllWorkflowStatusRecordsWillBeReturned() {

    webTestClient
        .get()
        .uri(uriBuilder ->
            uriBuilder
                .path("/api/v1/workflow_statuses")
                .build())
        .exchange()
        .expectStatus().isOk()
        .expectBodyList(WorkflowStatus.class)
        .value(response -> {

              Collections.sort(response);

              Assertions.assertThat(response.get(0).getId()).isEqualTo(workflowStatus1.getId());
              try {
                JSONAssert.assertEquals(workflowStatus1.getData(), response.get(0).getData(), false);
              } catch (JSONException e) {
                throw new RuntimeException(e);
              }
              Assertions.assertThat(response.get(0).getVersion()).isEqualTo(workflowStatus1.getVersion());

              Assertions.assertThat(response.get(1).getId()).isEqualTo(workflowStatus2.getId());
              try {
                JSONAssert.assertEquals(workflowStatus2.getData(), response.get(1).getData(), false);
              } catch (JSONException e) {
                throw new RuntimeException(e);
              }
              Assertions.assertThat(response.get(1).getVersion()).isEqualTo(workflowStatus2.getVersion());

              Assertions.assertThat(response.get(2).getId()).isEqualTo(workflowStatus3.getId());
              try {
                JSONAssert.assertEquals(workflowStatus3.getData(), response.get(2).getData(), false);
              } catch (JSONException e) {
                throw new RuntimeException(e);
              }
              Assertions.assertThat(response.get(2).getVersion()).isEqualTo(workflowStatus3.getVersion());


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

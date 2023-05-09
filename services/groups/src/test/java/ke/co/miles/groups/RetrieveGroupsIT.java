/*
 * Copyright (C) 2021 Second Mile
 *
 * This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0.
 * If a copy of the MPL was not distributed with this file,
 * You can obtain one at http://mozilla.org/MPL/2.0/.
 */
package ke.co.miles.groups;

import ke.co.miles.groups.models.Group;
import ke.co.miles.groups.util.builders.GroupBuilder;
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

import java.util.Collections;

/**
 * @author Kwaje Anthony <tony@miles.co.ke>
 * @version 1.0
 * @since 1.0
 */
@Testcontainers
@SpringBootTest(webEnvironment = WebEnvironment.RANDOM_PORT)
@AutoConfigureWebTestClient
@ContextConfiguration(initializers = RetrieveGroupsIT.Initializer.class)
public class RetrieveGroupsIT {

    @Autowired
    WebTestClient webTestClient;

    static final PostgreSQLContainer postgreSQLContainer;
    static final Group group1;
    static final Group group2;
    static final Group group3;

    static {

        postgreSQLContainer =
                new PostgreSQLContainer("postgres:10.15")
                        .withDatabaseName("test")
                        .withUsername("postgres")
                        .withPassword("postgres");

        postgreSQLContainer
                .withInitScript("init.sql")
                .start();

        group1 =
                new GroupBuilder()
                        .id(1L)
                        .data("{\"index\": 1, \"name\": \"First Group\", \"valid\": true}")
                        .version(1)
                        .build();

        group2 =
                new GroupBuilder()
                        .id(2L)
                        .data("{\"index\": 2, \"name\": \"Second Group\", \"valid\": true}")
                        .version(1)
                        .build();

        group3 =
                new GroupBuilder()
                        .id(3L)
                        .data("{\"index\": 3, \"name\": \"Third Group\", \"valid\": false}")
                        .version(1)
                        .build();
    }

    public static class Initializer implements ApplicationContextInitializer<ConfigurableApplicationContext> {

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
    public void Given_GroupRecordsExist_When_GetAllWithIdsFilter_Then_OnlyGroupRecordsWithTheSpecifiedIdsWillBeReturned() {

        webTestClient
                .get()
                .uri(uriBuilder ->
                        uriBuilder
                                .path("/api/v1/groups/test/all")
                                .queryParam("ids", "{id1}", "{id2}")
                                .build(group1.getId().toString(), group3.getId().toString()))
                .exchange()
                .expectStatus().isOk()
                .expectBodyList(Group.class)
                .value(response -> {

                            Collections.sort(response);

                            Assertions.assertThat(response.get(0).getId()).isEqualTo(group1.getId());
                            try {
                                JSONAssert.assertEquals(group1.getData(), response.get(0).getData(), false);
                            } catch (JSONException e) {
                                throw new RuntimeException(e);
                            }
                            Assertions.assertThat(response.get(0).getVersion()).isEqualTo(group1.getVersion());


                            Assertions.assertThat(response.get(1).getId()).isEqualTo(group3.getId());
                            try {
                                JSONAssert.assertEquals(group3.getData(), response.get(1).getData(), false);
                            } catch (JSONException e) {
                                throw new RuntimeException(e);
                            }
                            Assertions.assertThat(response.get(1).getVersion()).isEqualTo(group3.getVersion());

                        }
                );
    }

    @Test
    public void Given_GroupRecordsExist_When_GetAllWithOtherNumericValuedFilter_Then_OnlyGroupRecordsWithTheSpecifiedNumberWillBeReturned() {

        webTestClient
                .get()
                .uri(uriBuilder ->
                        uriBuilder
                                .path("/api/v1/groups/test/all")
                                .queryParam("index", "{param1}")
                                .build("3"))
                .exchange()
                .expectStatus().isOk()
                .expectBodyList(Group.class)
                .value(response -> {

                            Collections.sort(response);

                            Assertions.assertThat(response.get(0).getId()).isEqualTo(group3.getId());
                            try {
                                JSONAssert.assertEquals(group3.getData(), response.get(0).getData(), false);
                            } catch (JSONException e) {
                                throw new RuntimeException(e);
                            }
                            Assertions.assertThat(response.get(0).getVersion()).isEqualTo(1);


                        }
                );
    }

    @Test
    public void Given_GroupRecordsExist_When_GetAllWithOtherStringValuedFilter_Then_OnlyGroupRecordsWithTheSpecifiedStringValueWillBeReturned() {

        webTestClient
                .get()
                .uri(uriBuilder ->
                        uriBuilder
                                .path("/api/v1/groups/test/all")
                                .queryParam("name", "{param1}")
                                .build("Thi"))
                .exchange()
                .expectStatus().isOk()
                .expectBodyList(Group.class)
                .value(response -> {

                            Collections.sort(response);

                            Assertions.assertThat(response.get(0).getId()).isEqualTo(group3.getId());
                            try {
                                JSONAssert.assertEquals(group3.getData(), response.get(0).getData(), false);
                            } catch (JSONException e) {
                                throw new RuntimeException(e);
                            }
                            Assertions.assertThat(response.get(0).getVersion()).isEqualTo(1);


                        }
                );
    }


    @Test
    public void Given_GroupRecordsExist_When_GetAllWithOtherBooleanValuedFilter_Then_OnlyGroupRecordsWithTheSpecifiedBooleanWillBeReturned() {

        webTestClient
                .get()
                .uri(uriBuilder ->
                        uriBuilder
                                .path("/api/v1/groups/test/all")
                                .queryParam("valid", "{param1}")
                                .build("false"))
                .exchange()
                .expectStatus().isOk()
                .expectBodyList(Group.class)
                .value(response -> {

                            Collections.sort(response);

                            Assertions.assertThat(response.get(0).getId()).isEqualTo(group3.getId());
                            try {
                                JSONAssert.assertEquals(group3.getData(), response.get(0).getData(), false);
                            } catch (JSONException e) {
                                throw new RuntimeException(e);
                            }
                            Assertions.assertThat(response.get(0).getVersion()).isEqualTo(1);


                        }
                );
    }


    @Test
    public void Given_GroupRecordsExist_When_GetAllWithoutFilters_Then_AllGroupRecordsWillBeReturned() {

        webTestClient
                .get()
                .uri(uriBuilder ->
                        uriBuilder
                                .path("/api/v1/groups/test/all")
                                .build())
                .exchange()
                .expectStatus().isOk()
                .expectBodyList(Group.class)
                .value(response -> {

                            Collections.sort(response);

                            Assertions.assertThat(response.get(0).getId()).isEqualTo(group1.getId());
                            try {
                                JSONAssert.assertEquals(group1.getData(), response.get(0).getData(), false);
                            } catch (JSONException e) {
                                throw new RuntimeException(e);
                            }
                            Assertions.assertThat(response.get(0).getVersion()).isEqualTo(group1.getVersion());


                            Assertions.assertThat(response.get(1).getId()).isEqualTo(group2.getId());
                            try {
                                JSONAssert.assertEquals(group2.getData(), response.get(1).getData(), false);
                            } catch (JSONException e) {
                                throw new RuntimeException(e);
                            }
                            Assertions.assertThat(response.get(1).getVersion()).isEqualTo(group2.getVersion());


                            Assertions.assertThat(response.get(2).getId()).isEqualTo(group3.getId());
                            try {
                                JSONAssert.assertEquals(group3.getData(), response.get(2).getData(), false);
                            } catch (JSONException e) {
                                throw new RuntimeException(e);
                            }
                            Assertions.assertThat(response.get(2).getVersion()).isEqualTo(group3.getVersion());


                        }
                );
    }

    @Test
    public void Given_GroupRecordsExist_When_GetTotalGroupRecords_Then_TheTotalCountOfGroupRecordsWillBeReturned() {

        webTestClient
                .get()
                .uri(uriBuilder ->
                        uriBuilder
                                .path("/api/v1/groups/test/total")
                                .build())
                .exchange()
                .expectStatus().isOk()
                .expectBody(Long.class)
                .value(response -> Assertions.assertThat(response).isEqualTo(3L));
    }


    @Test
    public void Given_GroupRecordsExist_When_GetTotalGroupRecordsCorrespondingToAFilter_Then_TheTotalCountOfFilteredGroupRecordsWillBeReturned() {

        webTestClient
                .get()
                .uri(uriBuilder ->
                        uriBuilder
                                .path("/api/v1/groups/test/total")
                                .queryParam("name", "{param1}")
                                .build("Thi"))
                .exchange()
                .expectStatus().isOk()
                .expectBody(Long.class)
                .value(response -> Assertions.assertThat(response).isEqualTo(1L));
    }

}

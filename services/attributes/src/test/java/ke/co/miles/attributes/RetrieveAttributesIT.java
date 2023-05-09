/*
 * Copyright (C) 2021 Second Mile
 *
 * This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0.
 * If a copy of the MPL was not distributed with this file,
 * You can obtain one at http://mozilla.org/MPL/2.0/.
 */
package ke.co.miles.attributes;

import ke.co.miles.attributes.models.Attribute;
import ke.co.miles.attributes.util.builders.AttributeBuilder;
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
@ContextConfiguration(initializers = RetrieveAttributesIT.Initializer.class)
public class RetrieveAttributesIT {

    @Autowired
    WebTestClient webTestClient;

    static final PostgreSQLContainer postgreSQLContainer;
    static final Attribute attribute1;
    static final Attribute attribute2;
    static final Attribute attribute3;

    static {

        postgreSQLContainer =
                new PostgreSQLContainer("postgres:10.15")
                        .withDatabaseName("test")
                        .withUsername("postgres")
                        .withPassword("postgres");

        postgreSQLContainer
                .withInitScript("init.sql")
                .start();

        attribute1 =
                new AttributeBuilder()
                        .id(1L)
                        .data("{\"index\": 1, \"name\": \"First Attribute\", \"valid\": true}")
                        .version(1)
                        .build();

        attribute2 =
                new AttributeBuilder()
                        .id(2L)
                        .data("{\"index\": 2, \"name\": \"Second Attribute\", \"valid\": true}")
                        .version(1)
                        .build();

        attribute3 =
                new AttributeBuilder()
                        .id(3L)
                        .data("{\"index\": 3, \"name\": \"Third Attribute\", \"valid\": false}")
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
    public void Given_AttributeRecordsExist_When_GetAllWithIdsFilter_Then_OnlyAttributeRecordsWithTheSpecifiedIdsWillBeReturned() {

        webTestClient
                .get()
                .uri(uriBuilder ->
                        uriBuilder
                                .path("/api/v1/attributes/test/all")
                                .queryParam("ids", "{id1}", "{id2}")
                                .build(attribute1.getId().toString(), attribute3.getId().toString()))
                .exchange()
                .expectStatus().isOk()
                .expectBodyList(Attribute.class)
                .value(response -> {

                            Collections.sort(response);

                            Assertions.assertThat(response.get(0).getId()).isEqualTo(attribute1.getId());
                            try {
                                JSONAssert.assertEquals(attribute1.getData(), response.get(0).getData(), false);
                            } catch (JSONException e) {
                                throw new RuntimeException(e);
                            }
                            Assertions.assertThat(response.get(0).getVersion()).isEqualTo(attribute1.getVersion());


                            Assertions.assertThat(response.get(1).getId()).isEqualTo(attribute3.getId());
                            try {
                                JSONAssert.assertEquals(attribute3.getData(), response.get(1).getData(), false);
                            } catch (JSONException e) {
                                throw new RuntimeException(e);
                            }
                            Assertions.assertThat(response.get(1).getVersion()).isEqualTo(attribute3.getVersion());

                        }
                );
    }

    @Test
    public void Given_AttributeRecordsExist_When_GetAllWithOtherNumericValuedFilter_Then_OnlyAttributeRecordsWithTheSpecifiedNumberWillBeReturned() {

        webTestClient
                .get()
                .uri(uriBuilder ->
                        uriBuilder
                                .path("/api/v1/attributes/test/all")
                                .queryParam("index", "{param1}")
                                .build("3"))
                .exchange()
                .expectStatus().isOk()
                .expectBodyList(Attribute.class)
                .value(response -> {

                            Collections.sort(response);

                            Assertions.assertThat(response.get(0).getId()).isEqualTo(attribute3.getId());
                            try {
                                JSONAssert.assertEquals(attribute3.getData(), response.get(0).getData(), false);
                            } catch (JSONException e) {
                                throw new RuntimeException(e);
                            }
                            Assertions.assertThat(response.get(0).getVersion()).isEqualTo(1);


                        }
                );
    }

    @Test
    public void Given_AttributeRecordsExist_When_GetAllWithOtherStringValuedFilter_Then_OnlyAttributeRecordsWithTheSpecifiedStringValueWillBeReturned() {

        webTestClient
                .get()
                .uri(uriBuilder ->
                        uriBuilder
                                .path("/api/v1/attributes/test/all")
                                .queryParam("name", "{param1}")
                                .build("Thi"))
                .exchange()
                .expectStatus().isOk()
                .expectBodyList(Attribute.class)
                .value(response -> {

                            Collections.sort(response);

                            Assertions.assertThat(response.get(0).getId()).isEqualTo(attribute3.getId());
                            try {
                                JSONAssert.assertEquals(attribute3.getData(), response.get(0).getData(), false);
                            } catch (JSONException e) {
                                throw new RuntimeException(e);
                            }
                            Assertions.assertThat(response.get(0).getVersion()).isEqualTo(1);


                        }
                );
    }


    @Test
    public void Given_AttributeRecordsExist_When_GetAllWithOtherBooleanValuedFilter_Then_OnlyAttributeRecordsWithTheSpecifiedBooleanWillBeReturned() {

        webTestClient
                .get()
                .uri(uriBuilder ->
                        uriBuilder
                                .path("/api/v1/attributes/test/all")
                                .queryParam("valid", "{param1}")
                                .build("false"))
                .exchange()
                .expectStatus().isOk()
                .expectBodyList(Attribute.class)
                .value(response -> {

                            Collections.sort(response);

                            Assertions.assertThat(response.get(0).getId()).isEqualTo(attribute3.getId());
                            try {
                                JSONAssert.assertEquals(attribute3.getData(), response.get(0).getData(), false);
                            } catch (JSONException e) {
                                throw new RuntimeException(e);
                            }
                            Assertions.assertThat(response.get(0).getVersion()).isEqualTo(1);


                        }
                );
    }


    @Test
    public void Given_AttributeRecordsExist_When_GetAllWithoutFilters_Then_AllAttributeRecordsWillBeReturned() {

        webTestClient
                .get()
                .uri(uriBuilder ->
                        uriBuilder
                                .path("/api/v1/attributes/test/all")
                                .build())
                .exchange()
                .expectStatus().isOk()
                .expectBodyList(Attribute.class)
                .value(response -> {

                            Collections.sort(response);

                            Assertions.assertThat(response.get(0).getId()).isEqualTo(attribute1.getId());
                            try {
                                JSONAssert.assertEquals(attribute1.getData(), response.get(0).getData(), false);
                            } catch (JSONException e) {
                                throw new RuntimeException(e);
                            }
                            Assertions.assertThat(response.get(0).getVersion()).isEqualTo(attribute1.getVersion());


                            Assertions.assertThat(response.get(1).getId()).isEqualTo(attribute2.getId());
                            try {
                                JSONAssert.assertEquals(attribute2.getData(), response.get(1).getData(), false);
                            } catch (JSONException e) {
                                throw new RuntimeException(e);
                            }
                            Assertions.assertThat(response.get(1).getVersion()).isEqualTo(attribute2.getVersion());


                            Assertions.assertThat(response.get(2).getId()).isEqualTo(attribute3.getId());
                            try {
                                JSONAssert.assertEquals(attribute3.getData(), response.get(2).getData(), false);
                            } catch (JSONException e) {
                                throw new RuntimeException(e);
                            }
                            Assertions.assertThat(response.get(2).getVersion()).isEqualTo(attribute3.getVersion());


                        }
                );
    }

    @Test
    public void Given_AttributeRecordsExist_When_GetTotalAttributeRecords_Then_TheTotalCountOfAttributeRecordsWillBeReturned() {

        webTestClient
                .get()
                .uri(uriBuilder ->
                        uriBuilder
                                .path("/api/v1/attributes/test/total")
                                .build())
                .exchange()
                .expectStatus().isOk()
                .expectBody(Long.class)
                .value(response -> Assertions.assertThat(response).isEqualTo(3L));
    }


    @Test
    public void Given_AttributeRecordsExist_When_GetTotalAttributeRecordsCorrespondingToAFilter_Then_TheTotalCountOfFilteredAttributeRecordsWillBeReturned() {

        webTestClient
                .get()
                .uri(uriBuilder ->
                        uriBuilder
                                .path("/api/v1/attributes/test/total")
                                .queryParam("name", "{param1}")
                                .build("Thi"))
                .exchange()
                .expectStatus().isOk()
                .expectBody(Long.class)
                .value(response -> Assertions.assertThat(response).isEqualTo(1L));
    }

}

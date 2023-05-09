/*
 * Copyright (C) 2021 Second Mile
 *
 * This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0.
 * If a copy of the MPL was not distributed with this file,
 * You can obtain one at http://mozilla.org/MPL/2.0/.
 */
package ke.co.miles.accountabilitieshierarchies.configurations;

import org.davidmoten.rx.jdbc.Database;
import org.davidmoten.rx.jdbc.pool.DatabaseType;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;

import java.util.HashMap;
import java.util.Map;
import java.util.concurrent.TimeUnit;

/**
 * @author Kwaje Anthony <tony@miles.co.ke>
 * @version 1.0
 * @since 1.0
 */
@Configuration
public class DatabaseConfig {

    @Value("${database.host}")
    private String dbHost;

    @Value("${database.port}")
    private Integer dbPort;

    @Value("${database.username}")
    private String dbUsername;

    @Value("${database.password}")
    private String dbPassword;

    private final Map<String, Database> databases = new HashMap<>();

    public final Database getDatabase(String name) {
        return databases.computeIfAbsent(name, k ->
                Database
                        .nonBlocking()
                        .url(new StringBuilder("jdbc:postgresql://")
                                .append(this.dbHost)
                                .append(":")
                                .append(this.dbPort)
                                .append("/")
                                .append(k)
                                .toString())
                        .user(this.dbUsername)
                        .password(this.dbPassword)
                        .healthCheck(DatabaseType.POSTGRES)
                        .idleTimeBeforeHealthCheck(5, TimeUnit.SECONDS)
                        .maxPoolSize(Runtime.getRuntime().availableProcessors() * 5)
                        .build()
        );
    }


}

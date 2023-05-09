/*
 * Copyright (C) 2021 Second Mile
 *
 * This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0.
 * If a copy of the MPL was not distributed with this file,
 * You can obtain one at http://mozilla.org/MPL/2.0/.
 */
package ke.co.miles.organisations.configurations;

import java.util.concurrent.TimeUnit;
import org.davidmoten.rx.jdbc.Database;
import org.davidmoten.rx.jdbc.pool.DatabaseType;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;

/**
 * @author Kwaje Anthony <tony@miles.co.ke>
 * @version 1.0
 * @since 1.0
 */
@Configuration
public class DatabaseConfig {
  private Database database = null;
  @Value("${database.name}")
  String dbName;
  @Value("${database.host}")
  String dbHost;
  @Value("${database.port}")
  Integer dbPort;
  @Value("${database.username}")
  String dbUsername;
  @Value("${database.password}")
  String dbPassword;

  public final Database getDatabase() {

    if(this.database == null) {
      this.database = Database
          .nonBlocking()
          .url("jdbc:postgresql://"
              + this.dbHost
              + ":"
              + this.dbPort
              + "/"
              + dbName)
          .user(this.dbUsername)
          .password(this.dbPassword)
          .healthCheck(DatabaseType.POSTGRES)
          .idleTimeBeforeHealthCheck(5, TimeUnit.SECONDS)
          .maxPoolSize(Runtime.getRuntime().availableProcessors() * 5)
          .build();
    }
    return database;
  }


}

/*
 * Copyright (C) 2021 Second Mile
 *
 * This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0.
 * If a copy of the MPL was not distributed with this file,
 * You can obtain one at http://mozilla.org/MPL/2.0/.
 */
package ke.co.miles.systemmodules.repository.selection;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import ke.co.miles.systemmodules.configurations.DatabaseConfig;
import ke.co.miles.systemmodules.daos.QueryEstimates;
import ke.co.miles.systemmodules.exceptions.ServerException;
import ke.co.miles.systemmodules.util.builders.QueryWhereClauseBuilder;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.util.MultiValueMap;
import reactor.core.publisher.Mono;

/**
 * @author Kwaje Anthony <tony@miles.co.ke>
 * @version 1.0
 * @since 1.0
 */
@Component
@Slf4j
public class SelectTotalSystemsModulesQuery {

  @Value("${database.data.request.cost.threshold}")
  Double requestCostThreshold;

  @Autowired
  DatabaseConfig databaseConfig;

  /**
   * Selects the total number of systemsModules records to be retrieved, or an estimate of the total
   * number of systemsModules records to be retrieved - if the cost of retrieving the former is greater
   * than the acceptable threshold
   *
   * @param parameters the query parameters passed along with the request
   * @return the response containing the total number of systemsModules records to be retrieved
   */
  public Mono<Long> selectTotalSystemsModules(MultiValueMap<String, String> parameters) {

    log.trace("Entering selectTotalSystemsModules()");

    return
        Mono
            .from(databaseConfig
                .getDatabase()
                .select(getEstimatesQuery(parameters))
                .get(rs -> rs.getString("estimates")))
            .map(es -> {

              QueryEstimates q;

              try {
                q = new ObjectMapper().readValue(es, QueryEstimates.class);
              } catch (JsonProcessingException e) {
                return new ServerException(e);
              }

              return q;
            })
            .flatMap(q -> {

              if (q instanceof QueryEstimates) {

                if (((QueryEstimates) q).getCost() > requestCostThreshold) {

                  return Mono.just(((QueryEstimates) q).getRows());

                } else {

                  return Mono.from(
                      databaseConfig
                          .getDatabase()
                          .select(getQuery(parameters))
                          .get(rs -> rs.getLong("count")));
                }
              } else {
                return Mono.error((ServerException) q);
              }
            });
  }


  private String getEstimatesQuery(MultiValueMap<String, String> parameters) {
    return "SELECT getQueryEstimates($$" + " SELECT * FROM system_module" +
        new QueryWhereClauseBuilder().queryParameters(parameters).build() +
        " $$) AS estimates";
  }

  private String getQuery(MultiValueMap<String, String> parameters) {
    return "SELECT COUNT(*) FROM system_module" + new QueryWhereClauseBuilder().queryParameters(parameters)
        .build();
  }

}

/*
 * Copyright (C) 2021 Second Mile
 *
 * This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0.
 * If a copy of the MPL was not distributed with this file,
 * You can obtain one at http://mozilla.org/MPL/2.0/.
 */
package ke.co.miles.groups.util.builders;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.util.MultiValueMap;

import java.text.ParseException;
import java.util.Optional;

/**
 * @author Kwaje Anthony <tony@miles.co.ke>
 * @version 1.0
 * @since 0.0.1
 */
public class QueryWhereClauseBuilder {

    private MultiValueMap<String, String> queryParameters;

    private static final Logger LOGGER = LoggerFactory.getLogger(QueryWhereClauseBuilder.class);

    public QueryWhereClauseBuilder queryParameters(MultiValueMap<String, String> queryParameters) {
        this.queryParameters = queryParameters;
        return this;
    }

    public String build() {

        final StringBuilder query = new StringBuilder();

        // Ids
        Long[] ids =
                this.queryParameters.get("ids") == null ? null :
                        this.queryParameters
                                .get("ids")
                                .stream()
                                .map(Long::parseLong)
                                .sorted()
                                .toArray(Long[]::new);

        if (ids != null && ids.length != 0) {
            if (ids.length == 1) {
                query.append("id = ").append(ids[0]);
            } else {
                query.append("id IN (");

                int i = 0;
                while (i < ids.length) {
                    query.append(ids[i]);
                    if (i < ids.length - 1) {
                        query.append(",");
                    }
                    i++;
                }

                query.append(")");
            }
        }

        // Other
        this.queryParameters
                .keySet()
                .stream()
                .filter(key -> !(key.equalsIgnoreCase("ids")) &&
                        !(key.equalsIgnoreCase("limit")) &&
                        !(key.equalsIgnoreCase("offset")))
                .forEach(key -> {

                    Optional<String> value = this.queryParameters.get(key).stream().findFirst();

                    if (value.isPresent()) {
                        try {
                            if (!query.toString().isEmpty()) {
                                query.append(" AND ").append(getConditionalJSONBQuery(key, value.get()));
                            } else {
                                query.append(getConditionalJSONBQuery(key, value.get()));
                            }
                        } catch (ParseException exception) {
                            LOGGER.warn("Ignoring query where clause", exception);
                        }
                    }


                });

        return query.toString().isEmpty() ? "" : " WHERE " + query;
    }


    private String getConditionalJSONBQuery(String key, String value) throws ParseException {

        return " CASE jsonb_typeof(data->'" + key + "')" +
                " WHEN 'number' THEN (data->>'" + key + "') = '" + value + "'" +
                " WHEN 'string' THEN data->>'" + key + "'" + " LIKE '%" + value + "%'" +
                " WHEN 'boolean' THEN (data->>'" + key + "') = '" + value + "'" +
                " END";
    }

}

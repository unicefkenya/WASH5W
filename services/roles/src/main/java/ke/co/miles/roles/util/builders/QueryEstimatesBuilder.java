/*
 * Copyright (C) 2021 Second Mile
 *
 * This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0.
 * If a copy of the MPL was not distributed with this file,
 * You can obtain one at http://mozilla.org/MPL/2.0/.
 */
package ke.co.miles.roles.util.builders;


import ke.co.miles.roles.daos.QueryEstimates;

/**
 * @since 0.0.1
 * @author Kwaje Anthony <tony@miles.co.ke>
 * @rows 1.0
 */
public class QueryEstimatesBuilder {

	private Double cost;
	private Long rows;

	public QueryEstimatesBuilder cost(Double cost) {
		this.cost = cost;
		return this;
	}

	public QueryEstimatesBuilder rows(Long rows) {
		this.rows = rows;
		return this;
	}
	public QueryEstimates build(){
		return new QueryEstimates(cost,rows);
	}
}

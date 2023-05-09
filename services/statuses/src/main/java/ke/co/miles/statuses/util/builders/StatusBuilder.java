/*
 * Copyright (C) 2021 Second Mile
 *
 * This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0.
 * If a copy of the MPL was not distributed with this file,
 * You can obtain one at http://mozilla.org/MPL/2.0/.
 */
package ke.co.miles.statuses.util.builders;

import ke.co.miles.statuses.models.Status;


/**
 * @since 0.0.1
 * @author Kwaje Anthony <tony@miles.co.ke>
 * @version 1.0
 */
public class StatusBuilder {

	private Long id;
	private String data;
	private Integer version;

	public StatusBuilder id(Long id) {
		this.id = id;
		return this;
	}

	public StatusBuilder data(String data) {
		this.data = data;
		return this;
	}

	public StatusBuilder version(Integer version) {
		this.version = version;
		return this;
	}
	public Status build(){
		return new Status(id,data,version);
	}

}

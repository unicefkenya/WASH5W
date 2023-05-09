/*
 * Copyright (C) 2021 Second Mile
 *
 * This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0.
 * If a copy of the MPL was not distributed with this file,
 * You can obtain one at http://mozilla.org/MPL/2.0/.
 */
package ke.co.miles.groups.util.builders;

import ke.co.miles.groups.models.Group;


/**
 * @since 0.0.1
 * @author Kwaje Anthony <tony@miles.co.ke>
 * @version 1.0
 */
public class GroupBuilder {

	private Long id;
	private String data;
	private Integer version;

	public GroupBuilder id(Long id) {
		this.id = id;
		return this;
	}

	public GroupBuilder data(String data) {
		this.data = data;
		return this;
	}

	public GroupBuilder version(Integer version) {
		this.version = version;
		return this;
	}
	public Group build(){
		return new Group(id,data,version);
	}

}

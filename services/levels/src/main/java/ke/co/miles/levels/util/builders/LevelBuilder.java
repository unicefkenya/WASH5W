/*
 * Copyright (C) 2021 Second Mile
 *
 * This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0.
 * If a copy of the MPL was not distributed with this file,
 * You can obtain one at http://mozilla.org/MPL/2.0/.
 */
package ke.co.miles.levels.util.builders;

import ke.co.miles.levels.models.Level;


/**
 * @since 0.0.1
 * @author Kwaje Anthony <tony@miles.co.ke>
 * @version 1.0
 */
public class LevelBuilder {

	private Long id;
	private String data;
	private Integer version;

	public LevelBuilder id(Long id) {
		this.id = id;
		return this;
	}

	public LevelBuilder data(String data) {
		this.data = data;
		return this;
	}

	public LevelBuilder version(Integer version) {
		this.version = version;
		return this;
	}
	public Level build(){
		return new Level(id,data,version);
	}

}

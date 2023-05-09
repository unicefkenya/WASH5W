/*
 * Copyright (C) 2021 Second Mile
 *
 * This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0.
 * If a copy of the MPL was not distributed with this file,
 * You can obtain one at http://mozilla.org/MPL/2.0/.
 */
package ke.co.miles.attributes.util.builders;

import ke.co.miles.attributes.models.Attribute;


/**
 * @since 0.0.1
 * @author Kwaje Anthony <tony@miles.co.ke>
 * @version 1.0
 */
public class AttributeBuilder {

	private Long id;
	private String data;
	private Integer version;

	public AttributeBuilder id(Long id) {
		this.id = id;
		return this;
	}

	public AttributeBuilder data(String data) {
		this.data = data;
		return this;
	}

	public AttributeBuilder version(Integer version) {
		this.version = version;
		return this;
	}
	public Attribute build(){
		return new Attribute(id,data,version);
	}

}

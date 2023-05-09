/*
 * Copyright (C) 2021 Second Mile
 *
 * This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0.
 * If a copy of the MPL was not distributed with this file,
 * You can obtain one at http://mozilla.org/MPL/2.0/.
 */
package ke.co.miles.accountabilitieshierarchies.util.builders;

import ke.co.miles.accountabilitieshierarchies.models.AccountabilityHierarchy;


/**
 * @since 0.0.1
 * @author Kwaje Anthony <tony@miles.co.ke>
 * @version 1.0
 */
public class AccountabilityHierarchyBuilder {

	private Long id;
	private String data;
	private Integer version;

	public AccountabilityHierarchyBuilder id(Long id) {
		this.id = id;
		return this;
	}

	public AccountabilityHierarchyBuilder data(String data) {
		this.data = data;
		return this;
	}

	public AccountabilityHierarchyBuilder version(Integer version) {
		this.version = version;
		return this;
	}
	public AccountabilityHierarchy build(){
		return new AccountabilityHierarchy(id,data,version);
	}

}

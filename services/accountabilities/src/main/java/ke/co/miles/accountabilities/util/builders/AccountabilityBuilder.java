/*
 * Copyright (C) 2021 Second Mile
 *
 * This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0.
 * If a copy of the MPL was not distributed with this file,
 * You can obtain one at http://mozilla.org/MPL/2.0/.
 */
package ke.co.miles.accountabilities.util.builders;

import ke.co.miles.accountabilities.models.Accountability;


/**
 * @author Kwaje Anthony <tony@miles.co.ke>
 * @version 1.0
 * @since 0.0.1
 */
public class AccountabilityBuilder {

  private Long id;
  private Integer level = null;
  private String data;
  private Integer version;

  public AccountabilityBuilder id(Long id) {
    this.id = id;
    return this;
  }

  public AccountabilityBuilder level(Integer level) {
    this.level = level;
    return this;
  }

  public AccountabilityBuilder data(String data) {
    this.data = data;
    return this;
  }

  public AccountabilityBuilder version(Integer version) {
    this.version = version;
    return this;
  }

  public Accountability build() {
    return new Accountability(id, level, data, version);
  }

}

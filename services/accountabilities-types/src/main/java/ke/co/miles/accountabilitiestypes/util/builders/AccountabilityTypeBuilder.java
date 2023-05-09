/*
 * Copyright (C) 2021 Second Mile
 *
 * This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0.
 * If a copy of the MPL was not distributed with this file,
 * You can obtain one at http://mozilla.org/MPL/2.0/.
 */
package ke.co.miles.accountabilitiestypes.util.builders;

import ke.co.miles.accountabilitiestypes.models.AccountabilityType;


/**
 * @author Kwaje Anthony <tony@miles.co.ke>
 * @version 1.0
 * @since 0.0.1
 */
public class AccountabilityTypeBuilder {

  private Long id;
  private Integer level = null;
  private String data;
  private Integer version;

  public AccountabilityTypeBuilder id(Long id) {
    this.id = id;
    return this;
  }

  public AccountabilityTypeBuilder level(Integer level) {
    this.level = level;
    return this;
  }

  public AccountabilityTypeBuilder data(String data) {
    this.data = data;
    return this;
  }

  public AccountabilityTypeBuilder version(Integer version) {
    this.version = version;
    return this;
  }

  public AccountabilityType build() {
    return new AccountabilityType(id, level, data, version);
  }

}

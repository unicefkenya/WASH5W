/*
 * Copyright (C) 2021 Second Mile
 *
 * This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0.
 * If a copy of the MPL was not distributed with this file,
 * You can obtain one at http://mozilla.org/MPL/2.0/.
 */
package ke.co.miles.systemsroles.util.builders;

import ke.co.miles.systemsroles.models.SystemRole;


/**
 * @author Kwaje Anthony <tony@miles.co.ke>
 * @version 1.0
 * @since 0.0.1
 */
public class SystemRoleBuilder {

  private Long id;
  private String data;
  private Integer version;

  public SystemRoleBuilder id(Long id) {
    this.id = id;
    return this;
  }

  public SystemRoleBuilder data(String data) {
    this.data = data;
    return this;
  }

  public SystemRoleBuilder version(Integer version) {
    this.version = version;
    return this;
  }

  public SystemRole build() {
    return new SystemRole(id, data, version);
  }

}

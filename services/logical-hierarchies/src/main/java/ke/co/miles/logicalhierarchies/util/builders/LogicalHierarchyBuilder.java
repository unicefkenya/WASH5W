/*
 * Copyright (C) 2021 Second Mile
 *
 * This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0.
 * If a copy of the MPL was not distributed with this file,
 * You can obtain one at http://mozilla.org/MPL/2.0/.
 */
package ke.co.miles.logicalhierarchies.util.builders;

import ke.co.miles.logicalhierarchies.models.LogicalHierarchy;


/**
 * @author Kwaje Anthony <tony@miles.co.ke>
 * @version 1.0
 * @since 0.0.1
 */
public class LogicalHierarchyBuilder {

  private Long id;
  private String data;
  private Integer version;

  public LogicalHierarchyBuilder id(Long id) {
    this.id = id;
    return this;
  }

  public LogicalHierarchyBuilder data(String data) {
    this.data = data;
    return this;
  }

  public LogicalHierarchyBuilder version(Integer version) {
    this.version = version;
    return this;
  }

  public LogicalHierarchy build() {
    return new LogicalHierarchy(id, data, version);
  }

}

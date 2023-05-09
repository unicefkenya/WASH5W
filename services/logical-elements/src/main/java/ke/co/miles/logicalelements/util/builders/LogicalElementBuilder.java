/*
 * Copyright (C) 2021 Second Mile
 *
 * This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0.
 * If a copy of the MPL was not distributed with this file,
 * You can obtain one at http://mozilla.org/MPL/2.0/.
 */
package ke.co.miles.logicalelements.util.builders;

import ke.co.miles.logicalelements.models.LogicalElement;


/**
 * @author Kwaje Anthony <tony@miles.co.ke>
 * @version 1.0
 * @since 0.0.1
 */
public class LogicalElementBuilder {

  private Long id;
  private String data;
  private Integer version;

  public LogicalElementBuilder id(Long id) {
    this.id = id;
    return this;
  }

  public LogicalElementBuilder data(String data) {
    this.data = data;
    return this;
  }

  public LogicalElementBuilder version(Integer version) {
    this.version = version;
    return this;
  }

  public LogicalElement build() {
    return new LogicalElement(id, data, version);
  }

}

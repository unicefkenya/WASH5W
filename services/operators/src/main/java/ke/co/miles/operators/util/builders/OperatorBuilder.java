/*
 * Copyright (C) 2021 Second Mile
 *
 * This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0.
 * If a copy of the MPL was not distributed with this file,
 * You can obtain one at http://mozilla.org/MPL/2.0/.
 */
package ke.co.miles.operators.util.builders;

import ke.co.miles.operators.models.Operator;


/**
 * @author Kwaje Anthony <tony@miles.co.ke>
 * @version 1.0
 * @since 0.0.1
 */
public class OperatorBuilder {

  private Long id;
  private String data;
  private Integer version;

  public OperatorBuilder id(Long id) {
    this.id = id;
    return this;
  }

  public OperatorBuilder data(String data) {
    this.data = data;
    return this;
  }

  public OperatorBuilder version(Integer version) {
    this.version = version;
    return this;
  }

  public Operator build() {
    return new Operator(id, data, version);
  }

}

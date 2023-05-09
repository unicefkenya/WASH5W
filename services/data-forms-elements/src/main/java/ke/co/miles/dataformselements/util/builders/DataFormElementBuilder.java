/*
 * Copyright (C) 2021 Second Mile
 *
 * This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0.
 * If a copy of the MPL was not distributed with this file,
 * You can obtain one at http://mozilla.org/MPL/2.0/.
 */
package ke.co.miles.dataformselements.util.builders;

import ke.co.miles.dataformselements.models.DataFormElement;


/**
 * @author Kwaje Anthony <tony@miles.co.ke>
 * @version 1.0
 * @since 0.0.1
 */
public class DataFormElementBuilder {

  private Long id;
  private String data;
  private Integer version;

  public DataFormElementBuilder id(Long id) {
    this.id = id;
    return this;
  }

  public DataFormElementBuilder data(String data) {
    this.data = data;
    return this;
  }

  public DataFormElementBuilder version(Integer version) {
    this.version = version;
    return this;
  }

  public DataFormElement build() {
    return new DataFormElement(id, data, version);
  }

}

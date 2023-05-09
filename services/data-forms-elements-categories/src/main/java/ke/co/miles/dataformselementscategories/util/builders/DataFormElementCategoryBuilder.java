/*
 * Copyright (C) 2021 Second Mile
 *
 * This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0.
 * If a copy of the MPL was not distributed with this file,
 * You can obtain one at http://mozilla.org/MPL/2.0/.
 */
package ke.co.miles.dataformselementscategories.util.builders;

import ke.co.miles.dataformselementscategories.models.DataFormElementCategory;


/**
 * @author Kwaje Anthony <tony@miles.co.ke>
 * @version 1.0
 * @since 0.0.1
 */
public class DataFormElementCategoryBuilder {

  private Long id;
  private String data;
  private Integer version;

  public DataFormElementCategoryBuilder id(Long id) {
    this.id = id;
    return this;
  }

  public DataFormElementCategoryBuilder data(String data) {
    this.data = data;
    return this;
  }

  public DataFormElementCategoryBuilder version(Integer version) {
    this.version = version;
    return this;
  }

  public DataFormElementCategory build() {
    return new DataFormElementCategory(id, data, version);
  }

}

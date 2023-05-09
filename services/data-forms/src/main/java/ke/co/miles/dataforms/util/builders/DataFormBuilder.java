/*
 * Copyright (C) 2021 Second Mile
 *
 * This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0.
 * If a copy of the MPL was not distributed with this file,
 * You can obtain one at http://mozilla.org/MPL/2.0/.
 */
package ke.co.miles.dataforms.util.builders;

import ke.co.miles.dataforms.models.DataForm;


/**
 * @author Kwaje Anthony <tony@miles.co.ke>
 * @version 1.0
 * @since 0.0.1
 */
public class DataFormBuilder {

  private Long id;
  private String data;
  private Integer version;

  public DataFormBuilder id(Long id) {
    this.id = id;
    return this;
  }

  public DataFormBuilder data(String data) {
    this.data = data;
    return this;
  }

  public DataFormBuilder version(Integer version) {
    this.version = version;
    return this;
  }

  public DataForm build() {
    return new DataForm(id, data, version);
  }

}

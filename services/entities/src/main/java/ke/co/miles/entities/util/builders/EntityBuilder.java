/*
 * Copyright (C) 2021 Second Mile
 *
 * This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0.
 * If a copy of the MPL was not distributed with this file,
 * You can obtain one at http://mozilla.org/MPL/2.0/.
 */
package ke.co.miles.entities.util.builders;

import ke.co.miles.entities.models.Entity;


/**
 * @author Kwaje Anthony <tony@miles.co.ke>
 * @version 1.0
 * @since 0.0.1
 */
public class EntityBuilder {

  private Long id;
  private String data;
  private Integer version;

  public EntityBuilder id(Long id) {
    this.id = id;
    return this;
  }

  public EntityBuilder data(String data) {
    this.data = data;
    return this;
  }

  public EntityBuilder version(Integer version) {
    this.version = version;
    return this;
  }

  public Entity build() {
    return new Entity(id, data, version);
  }

}

/*
 * Copyright (C) 2021 Second Mile
 *
 * This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0.
 * If a copy of the MPL was not distributed with this file,
 * You can obtain one at http://mozilla.org/MPL/2.0/.
 */
package ke.co.miles.dissagregations.models;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * @author Kwaje Anthony <tony@miles.co.ke>
 * @version 1.0
 * @since 0.0.1
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Dissagregation implements Comparable<Dissagregation> {

  private Long id;
  private String data;
  private Integer version;

  @Override
  public int compareTo(Dissagregation dissagregation) {

    if (this.id != null && dissagregation.getId() != null) {
      return this.id.compareTo(dissagregation.getId());
    } else {
      return 0;
    }

  }
}

/*
 * Copyright (C) 2021 Second Mile
 *
 * This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0.
 * If a copy of the MPL was not distributed with this file,
 * You can obtain one at http://mozilla.org/MPL/2.0/.
 */
package ke.co.miles.accountabilities.models;

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
public class Accountability implements Comparable<Accountability> {

  private Long id;
  private Integer level;
  private String data;
  private Integer version;

  @Override
  public int compareTo(Accountability accountability) {

    if (this.id != null && accountability.getId() != null) {
      return this.id.compareTo(accountability.getId());
    } else {
      return 0;
    }

  }
}

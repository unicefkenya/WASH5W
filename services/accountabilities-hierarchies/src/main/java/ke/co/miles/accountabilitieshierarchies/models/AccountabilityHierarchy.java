/*
 * Copyright (C) 2021 Second Mile
 *
 * This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0.
 * If a copy of the MPL was not distributed with this file,
 * You can obtain one at http://mozilla.org/MPL/2.0/.
 */
package ke.co.miles.accountabilitieshierarchies.models;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * @since 0.0.1
 * @author Kwaje Anthony <tony@miles.co.ke>
 * @version 1.0
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class AccountabilityHierarchy implements Comparable<AccountabilityHierarchy> {

    private Long id;
    private String data;
    private Integer version;

    @Override
    public int compareTo(AccountabilityHierarchy accountabilityHierarchy) {

        if(this.id != null && accountabilityHierarchy.getId() != null){
            return this.id.compareTo(accountabilityHierarchy.getId());
        } else {
            return 0;
        }

    }
}

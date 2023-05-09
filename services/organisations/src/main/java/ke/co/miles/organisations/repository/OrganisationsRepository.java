/*
 * Copyright (C) 2021 Second Mile
 *
 * This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0.
 * If a copy of the MPL was not distributed with this file,
 * You can obtain one at http://mozilla.org/MPL/2.0/.
 */
package ke.co.miles.organisations.repository;


import ke.co.miles.organisations.models.Organisation;
import ke.co.miles.organisations.repository.deletion.DeleteOrganisationQuery;
import ke.co.miles.organisations.repository.insertion.InsertOrganisationQuery;
import ke.co.miles.organisations.repository.selection.SelectOrganisationsQuery;
import ke.co.miles.organisations.repository.selection.SelectOrganisationQuery;
import ke.co.miles.organisations.repository.selection.SelectTotalOrganisationsQuery;
import ke.co.miles.organisations.repository.updation.UpdateOrganisationQuery;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;
import org.springframework.util.MultiValueMap;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

/**
 * @author Kwaje Anthony <tony@miles.co.ke>
 * @version 1.0
 * @since 1.0
 */
@Component
@Slf4j
public class OrganisationsRepository {

  @Autowired
  InsertOrganisationQuery insertOrganisationQuery;

  @Autowired
  SelectOrganisationQuery selectOrganisationQuery;

  @Autowired
  SelectOrganisationsQuery selectOrganisationsQuery;

  @Autowired
  SelectTotalOrganisationsQuery selectTotalOrganisationsQuery;

  @Autowired
  UpdateOrganisationQuery updateOrganisationQuery;

  @Autowired
  DeleteOrganisationQuery deleteOrganisationQuery;

  public Mono<Long> insertOrganisation(Organisation organisation) {
    return insertOrganisationQuery.insertOrganisation(organisation);
  }

  public Mono<Organisation> selectOrganisation(Long id) {
    return selectOrganisationQuery.selectOrganisation(id);
  }

  public Flux<Organisation> selectOrganisations(MultiValueMap<String, String> parameters) {
    return selectOrganisationsQuery.selectOrganisations(parameters);
  }

  public Mono<Long> selectTotalOrganisations(MultiValueMap<String, String> parameters) {
    return selectTotalOrganisationsQuery.selectTotalOrganisations(parameters);
  }

  public Mono<Integer> updateOrganisation(Organisation organisation) {
    return updateOrganisationQuery.updateOrganisation(organisation);
  }

  public Mono<Integer> deleteOrganisationById(Long id) {
    return deleteOrganisationQuery.deleteOrganisation(id);
  }


}

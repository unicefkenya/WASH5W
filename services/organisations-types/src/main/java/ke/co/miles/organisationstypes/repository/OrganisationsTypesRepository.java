/*
 * Copyright (C) 2021 Second Mile
 *
 * This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0.
 * If a copy of the MPL was not distributed with this file,
 * You can obtain one at http://mozilla.org/MPL/2.0/.
 */
package ke.co.miles.organisationstypes.repository;


import ke.co.miles.organisationstypes.models.OrganisationType;
import ke.co.miles.organisationstypes.repository.deletion.DeleteOrganisationTypeQuery;
import ke.co.miles.organisationstypes.repository.insertion.InsertOrganisationTypeQuery;
import ke.co.miles.organisationstypes.repository.selection.SelectOrganisationTypeQuery;
import ke.co.miles.organisationstypes.repository.selection.SelectOrganisationsTypesQuery;
import ke.co.miles.organisationstypes.repository.selection.SelectTotalOrganisationsTypesQuery;
import ke.co.miles.organisationstypes.repository.updation.UpdateOrganisationTypeQuery;
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
public class OrganisationsTypesRepository {

  @Autowired
  InsertOrganisationTypeQuery insertOrganisationTypeQuery;

  @Autowired
  SelectOrganisationTypeQuery selectOrganisationTypeQuery;

  @Autowired
  SelectOrganisationsTypesQuery selectOrganisationsTypesQuery;

  @Autowired
  SelectTotalOrganisationsTypesQuery selectTotalOrganisationsTypesQuery;

  @Autowired
  UpdateOrganisationTypeQuery updateOrganisationTypeQuery;

  @Autowired
  DeleteOrganisationTypeQuery deleteOrganisationTypeQuery;

  public Mono<Long> insertOrganisationType(OrganisationType organisationType) {
    return insertOrganisationTypeQuery.insertOrganisationType(organisationType);
  }

  public Mono<OrganisationType> selectOrganisationType(Long id) {
    return selectOrganisationTypeQuery.selectOrganisationType(id);
  }

  public Flux<OrganisationType> selectOrganisationsTypes(MultiValueMap<String, String> parameters) {
    return selectOrganisationsTypesQuery.selectOrganisationsTypes(parameters);
  }

  public Mono<Long> selectTotalOrganisationsTypes(MultiValueMap<String, String> parameters) {
    return selectTotalOrganisationsTypesQuery.selectTotalOrganisationsTypes(parameters);
  }

  public Mono<Integer> updateOrganisationType(OrganisationType organisationType) {
    return updateOrganisationTypeQuery.updateOrganisationType(organisationType);
  }

  public Mono<Integer> deleteOrganisationTypeById(Long id) {
    return deleteOrganisationTypeQuery.deleteOrganisationType(id);
  }


}

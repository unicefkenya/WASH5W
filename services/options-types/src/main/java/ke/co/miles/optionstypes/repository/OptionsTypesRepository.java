/*
 * Copyright (C) 2021 Second Mile
 *
 * This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0.
 * If a copy of the MPL was not distributed with this file,
 * You can obtain one at http://mozilla.org/MPL/2.0/.
 */
package ke.co.miles.optionstypes.repository;


import ke.co.miles.optionstypes.models.OptionType;
import ke.co.miles.optionstypes.repository.deletion.DeleteOptionTypeQuery;
import ke.co.miles.optionstypes.repository.insertion.InsertOptionTypeQuery;
import ke.co.miles.optionstypes.repository.selection.SelectOptionTypeQuery;
import ke.co.miles.optionstypes.repository.selection.SelectOptionsTypesQuery;
import ke.co.miles.optionstypes.repository.selection.SelectTotalOptionsTypesQuery;
import ke.co.miles.optionstypes.repository.updation.UpdateOptionTypeQuery;
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
public class OptionsTypesRepository {

  @Autowired
  InsertOptionTypeQuery insertOptionTypeQuery;

  @Autowired
  SelectOptionTypeQuery selectOptionTypeQuery;

  @Autowired
  SelectOptionsTypesQuery selectOptionsTypesQuery;

  @Autowired
  SelectTotalOptionsTypesQuery selectTotalOptionsTypesQuery;

  @Autowired
  UpdateOptionTypeQuery updateOptionTypeQuery;

  @Autowired
  DeleteOptionTypeQuery deleteOptionTypeQuery;

  public Mono<Long> insertOptionType(OptionType optionType) {
    return insertOptionTypeQuery.insertOptionType(optionType);
  }

  public Mono<OptionType> selectOptionType(Long id) {
    return selectOptionTypeQuery.selectOptionType(id);
  }

  public Flux<OptionType> selectOptionsTypes(MultiValueMap<String, String> parameters) {
    return selectOptionsTypesQuery.selectOptionsTypes(parameters);
  }

  public Mono<Long> selectTotalOptionsTypes(MultiValueMap<String, String> parameters) {
    return selectTotalOptionsTypesQuery.selectTotalOptionsTypes(parameters);
  }

  public Mono<Integer> updateOptionType(OptionType optionType) {
    return updateOptionTypeQuery.updateOptionType(optionType);
  }

  public Mono<Integer> deleteOptionTypeById(Long id) {
    return deleteOptionTypeQuery.deleteOptionType(id);
  }


}

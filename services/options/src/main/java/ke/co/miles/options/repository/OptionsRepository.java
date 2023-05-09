/*
 * Copyright (C) 2021 Second Mile
 *
 * This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0.
 * If a copy of the MPL was not distributed with this file,
 * You can obtain one at http://mozilla.org/MPL/2.0/.
 */
package ke.co.miles.options.repository;


import ke.co.miles.options.models.Option;
import ke.co.miles.options.repository.deletion.DeleteOptionQuery;
import ke.co.miles.options.repository.insertion.InsertOptionQuery;
import ke.co.miles.options.repository.selection.SelectOptionsQuery;
import ke.co.miles.options.repository.selection.SelectOptionQuery;
import ke.co.miles.options.repository.selection.SelectTotalOptionsQuery;
import ke.co.miles.options.repository.updation.UpdateOptionQuery;
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
public class OptionsRepository {

  @Autowired
  InsertOptionQuery insertOptionQuery;

  @Autowired
  SelectOptionQuery selectOptionQuery;

  @Autowired
  SelectOptionsQuery selectOptionsQuery;

  @Autowired
  SelectTotalOptionsQuery selectTotalOptionsQuery;

  @Autowired
  UpdateOptionQuery updateOptionQuery;

  @Autowired
  DeleteOptionQuery deleteOptionQuery;

  public Mono<Long> insertOption(Option option) {
    return insertOptionQuery.insertOption(option);
  }

  public Mono<Option> selectOption(Long id) {
    return selectOptionQuery.selectOption(id);
  }

  public Flux<Option> selectOptions(MultiValueMap<String, String> parameters) {
    return selectOptionsQuery.selectOptions(parameters);
  }

  public Mono<Long> selectTotalOptions(MultiValueMap<String, String> parameters) {
    return selectTotalOptionsQuery.selectTotalOptions(parameters);
  }

  public Mono<Integer> updateOption(Option option) {
    return updateOptionQuery.updateOption(option);
  }

  public Mono<Integer> deleteOptionById(Long id) {
    return deleteOptionQuery.deleteOption(id);
  }


}

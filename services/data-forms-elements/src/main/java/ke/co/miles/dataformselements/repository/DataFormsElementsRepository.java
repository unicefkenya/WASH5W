/*
 * Copyright (C) 2021 Second Mile
 *
 * This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0.
 * If a copy of the MPL was not distributed with this file,
 * You can obtain one at http://mozilla.org/MPL/2.0/.
 */
package ke.co.miles.dataformselements.repository;


import ke.co.miles.dataformselements.models.DataFormElement;
import ke.co.miles.dataformselements.repository.deletion.DeleteDataFormElementQuery;
import ke.co.miles.dataformselements.repository.insertion.InsertDataFormElementQuery;
import ke.co.miles.dataformselements.repository.selection.SelectDataFormElementQuery;
import ke.co.miles.dataformselements.repository.selection.SelectDataFormsElementsQuery;
import ke.co.miles.dataformselements.repository.selection.SelectTotalDataFormsElementsQuery;
import ke.co.miles.dataformselements.repository.updation.UpdateDataFormElementQuery;
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
public class DataFormsElementsRepository {

  @Autowired
  InsertDataFormElementQuery insertDataFormElementQuery;

  @Autowired
  SelectDataFormElementQuery selectDataFormElementQuery;

  @Autowired
  SelectDataFormsElementsQuery selectDataFormsElementsQuery;

  @Autowired
  SelectTotalDataFormsElementsQuery selectTotalDataFormsElementsQuery;

  @Autowired
  UpdateDataFormElementQuery updateDataFormElementQuery;

  @Autowired
  DeleteDataFormElementQuery deleteDataFormElementQuery;

  public Mono<Long> insertDataFormElement(DataFormElement dataFormElement) {
    return insertDataFormElementQuery.insertDataFormElement(dataFormElement);
  }

  public Mono<DataFormElement> selectDataFormElement(Long id) {
    return selectDataFormElementQuery.selectDataFormElement(id);
  }

  public Flux<DataFormElement> selectDataFormsElements(MultiValueMap<String, String> parameters) {
    return selectDataFormsElementsQuery.selectDataFormsElements(parameters);
  }

  public Mono<Long> selectTotalDataFormsElements(MultiValueMap<String, String> parameters) {
    return selectTotalDataFormsElementsQuery.selectTotalDataFormsElements(parameters);
  }

  public Mono<Integer> updateDataFormElement(DataFormElement dataFormElement) {
    return updateDataFormElementQuery.updateDataFormElement(dataFormElement);
  }

  public Mono<Integer> deleteDataFormElementById(Long id) {
    return deleteDataFormElementQuery.deleteDataFormElement(id);
  }


}

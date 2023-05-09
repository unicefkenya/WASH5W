/*
 * Copyright (C) 2021 Second Mile
 *
 * This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0.
 * If a copy of the MPL was not distributed with this file,
 * You can obtain one at http://mozilla.org/MPL/2.0/.
 */
package ke.co.miles.dataforms.repository;


import ke.co.miles.dataforms.models.DataForm;
import ke.co.miles.dataforms.repository.deletion.DeleteDataFormQuery;
import ke.co.miles.dataforms.repository.insertion.InsertDataFormQuery;
import ke.co.miles.dataforms.repository.selection.SelectDataFormQuery;
import ke.co.miles.dataforms.repository.selection.SelectDataFormsQuery;
import ke.co.miles.dataforms.repository.selection.SelectTotalDataFormsQuery;
import ke.co.miles.dataforms.repository.updation.UpdateDataFormQuery;
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
public class DataFormsRepository {

  @Autowired
  InsertDataFormQuery insertDataFormQuery;

  @Autowired
  SelectDataFormQuery selectDataFormQuery;

  @Autowired
  SelectDataFormsQuery selectDataFormsQuery;

  @Autowired
  SelectTotalDataFormsQuery selectTotalDataFormsQuery;

  @Autowired
  UpdateDataFormQuery updateDataFormQuery;

  @Autowired
  DeleteDataFormQuery deleteDataFormQuery;

  public Mono<Long> insertDataForm(DataForm dataForm) {
    return insertDataFormQuery.insertDataForm(dataForm);
  }

  public Mono<DataForm> selectDataForm(Long id) {
    return selectDataFormQuery.selectDataForm(id);
  }

  public Flux<DataForm> selectDataForms(MultiValueMap<String, String> parameters) {
    return selectDataFormsQuery.selectDataForms(parameters);
  }

  public Mono<Long> selectTotalDataForms(MultiValueMap<String, String> parameters) {
    return selectTotalDataFormsQuery.selectTotalDataForms(parameters);
  }

  public Mono<Integer> updateDataForm(DataForm dataForm) {
    return updateDataFormQuery.updateDataForm(dataForm);
  }

  public Mono<Integer> deleteDataFormById(Long id) {
    return deleteDataFormQuery.deleteDataForm(id);
  }


}

/*
 * Copyright (C) 2021 Second Mile
 *
 * This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0.
 * If a copy of the MPL was not distributed with this file,
 * You can obtain one at http://mozilla.org/MPL/2.0/.
 */
package ke.co.miles.dataformselementstypes.repository;


import ke.co.miles.dataformselementstypes.models.DataFormElementType;
import ke.co.miles.dataformselementstypes.repository.deletion.DeleteDataFormElementTypeQuery;
import ke.co.miles.dataformselementstypes.repository.insertion.InsertDataFormElementTypeQuery;
import ke.co.miles.dataformselementstypes.repository.selection.SelectDataFormElementTypeQuery;
import ke.co.miles.dataformselementstypes.repository.selection.SelectDataFormsElementsTypesQuery;
import ke.co.miles.dataformselementstypes.repository.selection.SelectTotalDataFormsElementsTypesQuery;
import ke.co.miles.dataformselementstypes.repository.updation.UpdateDataFormElementTypeQuery;
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
public class DataFormsElementsTypesRepository {

  @Autowired
  InsertDataFormElementTypeQuery insertDataFormElementTypeQuery;

  @Autowired
  SelectDataFormElementTypeQuery selectDataFormElementTypeQuery;

  @Autowired
  SelectDataFormsElementsTypesQuery selectDataFormsElementsTypesQuery;

  @Autowired
  SelectTotalDataFormsElementsTypesQuery selectTotalDataFormsElementsTypesQuery;

  @Autowired
  UpdateDataFormElementTypeQuery updateDataFormElementTypeQuery;

  @Autowired
  DeleteDataFormElementTypeQuery deleteDataFormElementTypeQuery;

  public Mono<Long> insertDataFormElementType(DataFormElementType dataFormElementType) {
    return insertDataFormElementTypeQuery.insertDataFormElementType(dataFormElementType);
  }

  public Mono<DataFormElementType> selectDataFormElementType(Long id) {
    return selectDataFormElementTypeQuery.selectDataFormElementType(id);
  }

  public Flux<DataFormElementType> selectDataFormsElementsTypes(MultiValueMap<String, String> parameters) {
    return selectDataFormsElementsTypesQuery.selectDataFormsElementsTypes(parameters);
  }

  public Mono<Long> selectTotalDataFormsElementsTypes(MultiValueMap<String, String> parameters) {
    return selectTotalDataFormsElementsTypesQuery.selectTotalDataFormsElementsTypes(parameters);
  }

  public Mono<Integer> updateDataFormElementType(DataFormElementType dataFormElementType) {
    return updateDataFormElementTypeQuery.updateDataFormElementType(dataFormElementType);
  }

  public Mono<Integer> deleteDataFormElementTypeById(Long id) {
    return deleteDataFormElementTypeQuery.deleteDataFormElementType(id);
  }


}

/*
 * Copyright (C) 2021 Second Mile
 *
 * This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0.
 * If a copy of the MPL was not distributed with this file,
 * You can obtain one at http://mozilla.org/MPL/2.0/.
 */
package ke.co.miles.dataformselementscategories.repository;


import ke.co.miles.dataformselementscategories.models.DataFormElementCategory;
import ke.co.miles.dataformselementscategories.repository.deletion.DeleteDataFormElementCategoryQuery;
import ke.co.miles.dataformselementscategories.repository.insertion.InsertDataFormElementCategoryQuery;
import ke.co.miles.dataformselementscategories.repository.selection.SelectDataFormElementCategoryQuery;
import ke.co.miles.dataformselementscategories.repository.selection.SelectDataFormsElementsCategoriesQuery;
import ke.co.miles.dataformselementscategories.repository.selection.SelectTotalDataFormsElementsCategoriesQuery;
import ke.co.miles.dataformselementscategories.repository.updation.UpdateDataFormElementCategoryQuery;
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
public class DataFormsElementsCategoriesRepository {

  @Autowired
  InsertDataFormElementCategoryQuery insertDataFormElementCategoryQuery;

  @Autowired
  SelectDataFormElementCategoryQuery selectDataFormElementCategoryQuery;

  @Autowired
  SelectDataFormsElementsCategoriesQuery selectDataFormsElementsCategoriesQuery;

  @Autowired
  SelectTotalDataFormsElementsCategoriesQuery selectTotalDataFormsElementsCategoriesQuery;

  @Autowired
  UpdateDataFormElementCategoryQuery updateDataFormElementCategoryQuery;

  @Autowired
  DeleteDataFormElementCategoryQuery deleteDataFormElementCategoryQuery;

  public Mono<Long> insertDataFormElementCategory(DataFormElementCategory dataFormElementCategory) {
    return insertDataFormElementCategoryQuery.insertDataFormElementCategory(dataFormElementCategory);
  }

  public Mono<DataFormElementCategory> selectDataFormElementCategory(Long id) {
    return selectDataFormElementCategoryQuery.selectDataFormElementCategory(id);
  }

  public Flux<DataFormElementCategory> selectDataFormsElementsCategories(MultiValueMap<String, String> parameters) {
    return selectDataFormsElementsCategoriesQuery.selectDataFormsElementsCategories(parameters);
  }

  public Mono<Long> selectTotalDataFormsElementsCategories(MultiValueMap<String, String> parameters) {
    return selectTotalDataFormsElementsCategoriesQuery.selectTotalDataFormsElementsCategories(parameters);
  }

  public Mono<Integer> updateDataFormElementCategory(DataFormElementCategory dataFormElementCategory) {
    return updateDataFormElementCategoryQuery.updateDataFormElementCategory(dataFormElementCategory);
  }

  public Mono<Integer> deleteDataFormElementCategoryById(Long id) {
    return deleteDataFormElementCategoryQuery.deleteDataFormElementCategory(id);
  }


}

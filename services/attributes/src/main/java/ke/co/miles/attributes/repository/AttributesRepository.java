/*
 * Copyright (C) 2021 Second Mile
 *
 * This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0.
 * If a copy of the MPL was not distributed with this file,
 * You can obtain one at http://mozilla.org/MPL/2.0/.
 */
package ke.co.miles.attributes.repository;


import ke.co.miles.attributes.models.Attribute;
import ke.co.miles.attributes.repository.selection.SelectTotalAttributesQuery;
import ke.co.miles.attributes.repository.updation.UpdateAttributeQuery;
import ke.co.miles.attributes.repository.updation.UpdateAttributesQuery;
import ke.co.miles.attributes.repository.deletion.DeleteAttributeQuery;
import ke.co.miles.attributes.repository.deletion.DeleteAttributesQuery;
import ke.co.miles.attributes.repository.selection.SelectAttributesQuery;
import ke.co.miles.attributes.repository.insertion.InsertAttributeQuery;
import ke.co.miles.attributes.repository.insertion.InsertAttributesQuery;
import ke.co.miles.attributes.repository.selection.SelectAttributeQuery;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;
import org.springframework.util.MultiValueMap;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

/**
 * @since 1.0
 * @author Kwaje Anthony <tony@miles.co.ke>
 * @version 1.0
 */
@Component
@Slf4j
public class AttributesRepository {

	@Autowired
	InsertAttributeQuery insertAttributeQuery;
	
	@Autowired
	InsertAttributesQuery insertAttributesQuery;
	
	@Autowired
	SelectAttributeQuery selectAttributeQuery;
	
	@Autowired
	SelectAttributesQuery selectAttributesQuery;

	@Autowired
	SelectTotalAttributesQuery selectTotalAttributesQuery;

	@Autowired
	UpdateAttributeQuery updateAttributeQuery;
	
	@Autowired
	UpdateAttributesQuery updateAttributesQuery;
	
	@Autowired
	DeleteAttributeQuery deleteAttributeQuery;
	
	@Autowired
    DeleteAttributesQuery deleteAttributesQuery;

	public Mono<Long> insertAttribute(String database, Attribute attribute) {
		return insertAttributeQuery.insertAttribute(database, attribute);
	}
	
	public Flux<Long> insertAttributes(String database, Attribute[] attributes) {
		return insertAttributesQuery.insertAttributes(database, attributes);
	}

	public Mono<Attribute> selectAttribute(String database, Long id) {
		return selectAttributeQuery.selectAttribute(database, id);
	}
	
	public Flux<Attribute> selectAttributes(String database, MultiValueMap<String,String> parameters) {
		return selectAttributesQuery.selectAttributes(database, parameters);
	}

	public Mono<Long> selectTotalAttributes(String database, MultiValueMap<String,String> parameters) {
		return selectTotalAttributesQuery.selectTotalAttributes(database, parameters);
	}

	public Mono<Integer> updateAttribute(String database, Attribute attribute) {
		return updateAttributeQuery.updateAttribute(database, attribute);
	}
	
	public Flux<Integer> updateAttributes(String database, Attribute[] attributes) {
		return updateAttributesQuery.updateAttributes(database, attributes);
	}	
	
	public Mono<Integer> deleteAttributeById(String database, Long id) {
		return deleteAttributeQuery.deleteAttribute(database, id);
	}
	
	public Mono<Integer> deleteAttributes(String database, MultiValueMap<String,String> parameters) {
		return deleteAttributesQuery.deleteAttributes(database, parameters);
	}

}

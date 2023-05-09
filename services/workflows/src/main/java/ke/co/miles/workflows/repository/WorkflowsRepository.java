/*
 * Copyright (C) 2021 Second Mile
 *
 * This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0.
 * If a copy of the MPL was not distributed with this file,
 * You can obtain one at http://mozilla.org/MPL/2.0/.
 */
package ke.co.miles.workflows.repository;


import ke.co.miles.workflows.models.Workflow;
import ke.co.miles.workflows.repository.deletion.DeleteWorkflowQuery;
import ke.co.miles.workflows.repository.insertion.InsertWorkflowQuery;
import ke.co.miles.workflows.repository.selection.SelectWorkflowsQuery;
import ke.co.miles.workflows.repository.selection.SelectWorkflowQuery;
import ke.co.miles.workflows.repository.selection.SelectTotalWorkflowsQuery;
import ke.co.miles.workflows.repository.updation.UpdateWorkflowQuery;
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
public class WorkflowsRepository {

  @Autowired
  InsertWorkflowQuery insertWorkflowQuery;

  @Autowired
  SelectWorkflowQuery selectWorkflowQuery;

  @Autowired
  SelectWorkflowsQuery selectWorkflowsQuery;

  @Autowired
  SelectTotalWorkflowsQuery selectTotalWorkflowsQuery;

  @Autowired
  UpdateWorkflowQuery updateWorkflowQuery;

  @Autowired
  DeleteWorkflowQuery deleteWorkflowQuery;

  public Mono<Long> insertWorkflow(Workflow workflow) {
    return insertWorkflowQuery.insertWorkflow(workflow);
  }

  public Mono<Workflow> selectWorkflow(Long id) {
    return selectWorkflowQuery.selectWorkflow(id);
  }

  public Flux<Workflow> selectWorkflows(MultiValueMap<String, String> parameters) {
    return selectWorkflowsQuery.selectWorkflows(parameters);
  }

  public Mono<Long> selectTotalWorkflows(MultiValueMap<String, String> parameters) {
    return selectTotalWorkflowsQuery.selectTotalWorkflows(parameters);
  }

  public Mono<Integer> updateWorkflow(Workflow workflow) {
    return updateWorkflowQuery.updateWorkflow(workflow);
  }

  public Mono<Integer> deleteWorkflowById(Long id) {
    return deleteWorkflowQuery.deleteWorkflow(id);
  }


}

/*
 * Copyright (C) 2021 Second Mile
 *
 * This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0.
 * If a copy of the MPL was not distributed with this file,
 * You can obtain one at http://mozilla.org/MPL/2.0/.
 */
package ke.co.miles.workflowstatuses.repository;


import ke.co.miles.workflowstatuses.models.WorkflowStatus;
import ke.co.miles.workflowstatuses.repository.deletion.DeleteWorkflowStatusQuery;
import ke.co.miles.workflowstatuses.repository.insertion.InsertWorkflowStatusQuery;
import ke.co.miles.workflowstatuses.repository.selection.SelectWorkflowStatusQuery;
import ke.co.miles.workflowstatuses.repository.selection.SelectWorkflowStatusesQuery;
import ke.co.miles.workflowstatuses.repository.selection.SelectTotalWorkflowStatusesQuery;
import ke.co.miles.workflowstatuses.repository.updation.UpdateWorkflowStatusQuery;
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
public class WorkflowStatusesRepository {

  @Autowired
  InsertWorkflowStatusQuery insertWorkflowStatusQuery;

  @Autowired
  SelectWorkflowStatusQuery selectWorkflowStatusQuery;

  @Autowired
  SelectWorkflowStatusesQuery selectWorkflowStatusesQuery;

  @Autowired
  SelectTotalWorkflowStatusesQuery selectTotalWorkflowStatusesQuery;

  @Autowired
  UpdateWorkflowStatusQuery updateWorkflowStatusQuery;

  @Autowired
  DeleteWorkflowStatusQuery deleteWorkflowStatusQuery;

  public Mono<Long> insertWorkflowStatus(WorkflowStatus workflowStatus) {
    return insertWorkflowStatusQuery.insertWorkflowStatus(workflowStatus);
  }

  public Mono<WorkflowStatus> selectWorkflowStatus(Long id) {
    return selectWorkflowStatusQuery.selectWorkflowStatus(id);
  }

  public Flux<WorkflowStatus> selectWorkflowStatuses(MultiValueMap<String, String> parameters) {
    return selectWorkflowStatusesQuery.selectWorkflowStatuses(parameters);
  }

  public Mono<Long> selectTotalWorkflowStatuses(MultiValueMap<String, String> parameters) {
    return selectTotalWorkflowStatusesQuery.selectTotalWorkflowStatuses(parameters);
  }

  public Mono<Integer> updateWorkflowStatus(WorkflowStatus workflowStatus) {
    return updateWorkflowStatusQuery.updateWorkflowStatus(workflowStatus);
  }

  public Mono<Integer> deleteWorkflowStatusById(Long id) {
    return deleteWorkflowStatusQuery.deleteWorkflowStatus(id);
  }


}

import { WorkflowStatusData } from "./workflow-status-data.model";

export class WorkflowStatus {

	id!: number | null;
	data!: WorkflowStatusData;	
	version!: number | null;

    constructor(options?: Partial<WorkflowStatus>) {
        Object.assign(this, options);
    }	
}
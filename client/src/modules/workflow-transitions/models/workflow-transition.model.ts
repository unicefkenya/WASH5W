import { WorkflowTransitionData } from "./workflow-transition-data.model";

export class WorkflowTransition {

	id!: number | null;
	data!: WorkflowTransitionData;	
	version!: number | null;

    constructor(options?: Partial<WorkflowTransition>) {
        Object.assign(this, options);
    }	
}
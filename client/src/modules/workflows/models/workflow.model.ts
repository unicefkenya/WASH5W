import { WorkflowData } from "./workflow-data.model";

export class Workflow {

	id!: number | null;
	data!: WorkflowData;	
	version!: number | null;

    constructor(options?: Partial<Workflow>) {
        Object.assign(this, options);
    }	
}
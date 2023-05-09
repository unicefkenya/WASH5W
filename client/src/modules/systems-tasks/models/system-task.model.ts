import { SystemTaskData } from "./system-task-data.model";

export class SystemTask {

	id!: number | null;
	data!: SystemTaskData;	
	version!: number | null;

    constructor(options?: Partial<SystemTask>) {
        Object.assign(this, options);
    }	
}
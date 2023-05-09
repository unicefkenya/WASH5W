import { LogicalHierarchyData } from "./logical-hierarchy-data.model";

export class LogicalHierarchy {

	id!: number | null;
	data!: LogicalHierarchyData;	
	version!: number | null;

    constructor(options?: Partial<LogicalHierarchy>) {
        Object.assign(this, options);
    }	
}
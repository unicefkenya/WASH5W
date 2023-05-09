import { LogicalStructureData } from "./logical-structure-data.model";

export class LogicalStructure {

	id!: number | null;
	data!: LogicalStructureData;	
	version!: number | null;

    constructor(options?: Partial<LogicalStructure>) {
        Object.assign(this, options);
    }	
}
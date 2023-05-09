import { LogicalElementTypeData } from "./logical-element-type-data.model";

export class LogicalElementType {

	id!: number | null;
	data!: LogicalElementTypeData;	
	version!: number | null;

    constructor(options?: Partial<LogicalElementType>) {
        Object.assign(this, options);
    }	
}
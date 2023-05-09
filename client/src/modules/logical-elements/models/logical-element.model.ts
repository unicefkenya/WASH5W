import { LogicalElementData } from "./logical-element-data.model";

export class LogicalElement {

	id!: number | null;
	data!: LogicalElementData;	
	version!: number | null;

    constructor(options?: Partial<LogicalElement>) {
        Object.assign(this, options);
    }	
}
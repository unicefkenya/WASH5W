import { LogicalSchemeData } from "./logical-scheme-data.model";

export class LogicalScheme {

	id!: number | null;
	data!: LogicalSchemeData;	
	version!: number | null;

    constructor(options?: Partial<LogicalScheme>) {
        Object.assign(this, options);
    }	
}
export class LogicalElementData {

	contextId: number | null | undefined;
	typeId: number | null | undefined;    
    no: string | null | undefined;
    name: string | null | undefined;
    description: string | null | undefined;

    constructor(options?: Partial<LogicalElementData>) {
        Object.assign(this, options);
    }	
}
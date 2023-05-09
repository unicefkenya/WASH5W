import { ContextData } from "./context-data.model";

export class Context {

	id!: number | null;
	data!: ContextData;	
	version!: number | null;

    constructor(options?: Partial<Context>) {
        Object.assign(this, options);
    }	
}
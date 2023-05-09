import { ScopeTypeData } from "./scope-type-data.model";

export class ScopeType {

	id!: number | null;
	data!: ScopeTypeData;	
	version!: number | null;

    constructor(options?: Partial<ScopeType>) {
        Object.assign(this, options);
    }	
}
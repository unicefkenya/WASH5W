import { DomainData } from "./domain-data.model";

export class Domain {

	id!: number | null;
	data!: DomainData;	
	version!: number | null;

    constructor(options?: Partial<Domain>) {
        Object.assign(this, options);
    }	
}
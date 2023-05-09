import { OrganisationData } from "./organisation-data.model";

export class Organisation {

	id!: number | null;
	data!: OrganisationData;	
	version!: number | null;

    constructor(options?: Partial<Organisation>) {
        Object.assign(this, options);
    }	
}
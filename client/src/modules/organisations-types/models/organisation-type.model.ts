import { OrganisationTypeData } from "./organisation-type-data.model";

export class OrganisationType {

	id!: number | null;
	data!: OrganisationTypeData;	
	version!: number | null;

    constructor(options?: Partial<OrganisationType>) {
        Object.assign(this, options);
    }	
}
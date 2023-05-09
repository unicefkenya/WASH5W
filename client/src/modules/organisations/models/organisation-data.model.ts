export class OrganisationData {

	typeId: number | null | undefined;
    name: string | null | undefined;
    abbreviation: string | null | undefined;
    website: string | null | undefined;

    constructor(options?: Partial<OrganisationData>) {
        Object.assign(this, options);
    }	
}
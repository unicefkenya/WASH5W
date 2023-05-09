export class OrganisationTypeData {

    name: string | null | undefined;
    plural: string | null | undefined;
    abbreviation: string | null | undefined;
    colourCode: string | null | undefined;

    constructor(options?: Partial<OrganisationTypeData>) {
        Object.assign(this, options);
    }
}
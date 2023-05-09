export class AdministrativeUnitTypeData {

    name: string | null | undefined;
    plural: string | null | undefined;

    constructor(options?: Partial<AdministrativeUnitTypeData>) {
        Object.assign(this, options);
    }
}
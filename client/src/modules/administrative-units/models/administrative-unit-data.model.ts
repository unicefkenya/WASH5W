export class AdministrativeUnitData {

	typeId: number | null | undefined;
    name: string | null | undefined;

    constructor(options?: Partial<AdministrativeUnitData>) {
        Object.assign(this, options);
    }	
}
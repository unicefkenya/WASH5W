export class AdministrativeStructureData {

    hierarchy: {id: number | null | undefined;name: string | null | undefined;} | null | undefined;
    commissioner: {id: number | null | undefined;name: string | null | undefined;} | null | undefined;
    responsible: {id: number | null | undefined;name: string | null | undefined;} | null | undefined;

    constructor(options?: Partial<AdministrativeStructureData>) {
        Object.assign(this, options);
    }

}
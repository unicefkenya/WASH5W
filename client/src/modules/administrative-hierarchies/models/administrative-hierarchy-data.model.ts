export class AdministrativeHierarchyData {

    type: {id: number | null | undefined; } | null | undefined;
    commissioner: {id: number | null | undefined; name: string | null | undefined;} | null | undefined;
    responsible: {id: number | null | undefined; name: string | null | undefined;} | null | undefined;

    constructor(options?: Partial<AdministrativeHierarchyData>) {
        Object.assign(this, options);
    }	
}
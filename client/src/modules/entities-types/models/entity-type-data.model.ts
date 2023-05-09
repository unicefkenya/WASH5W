export class EntityTypeData {

	contextId: number | null | undefined;
    optionsTypesIds: number[] | null | undefined;
    name: string | null | undefined;	
    plural: string | null | undefined;

    constructor(options?: Partial<EntityTypeData>) {
        Object.assign(this, options);
    }	
}
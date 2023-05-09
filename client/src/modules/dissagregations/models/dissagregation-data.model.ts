export class DissagregationData {

	typeId: number | null | undefined;
    name: string | null | undefined;

    constructor(dissagregations?: Partial<DissagregationData>) {
        Object.assign(this, dissagregations);
    }	
}
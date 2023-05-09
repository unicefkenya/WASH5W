import { DissagregationData } from "./dissagregation-data.model";

export class Dissagregation {

	id!: number | null;
	data!: DissagregationData;	
	version!: number | null;

    constructor(dissagregations?: Partial<Dissagregation>) {
        Object.assign(this, dissagregations);
    }	
}
import { DissagregationSchemeData } from "./dissagregation-scheme-data.model";

export class DissagregationScheme {

	id!: number | null;
	data!: DissagregationSchemeData;	
	version!: number | null;

    constructor(options?: Partial<DissagregationScheme>) {
        Object.assign(this, options);
    }	
}
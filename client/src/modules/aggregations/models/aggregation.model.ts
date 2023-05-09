import { AggregationData } from "./aggregation-data.model";

export class Aggregation {

	id!: number | null;
	data!: AggregationData;	
	version!: number | null;

    constructor(options?: Partial<Aggregation>) {
        Object.assign(this, options);
    }	
}
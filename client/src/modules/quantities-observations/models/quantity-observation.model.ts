import { QuantityObservationData } from "./quantity-observation-data.model";

export class QuantityObservation {

	id!: number | null;
    data!: QuantityObservationData;	
	version!: number | null;

    constructor(options?: Partial<QuantityObservation>) {
        Object.assign(this, options);
    }	
}
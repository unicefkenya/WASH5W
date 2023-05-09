import { IndicatorData } from "./indicator-data.model";

export class Indicator {

	id!: number | null;
	data!: IndicatorData;	
	version!: number | null;

    constructor(options?: Partial<Indicator>) {
        Object.assign(this, options);
    }	
}
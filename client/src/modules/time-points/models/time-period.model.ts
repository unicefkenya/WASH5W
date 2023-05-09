import { TimePeriodData } from "./time-period-data.model";

export class TimePeriod {

	id!: number | null;
	data!: TimePeriodData;	
	version!: number | null;

    constructor(options?: Partial<TimePeriod>) {
        Object.assign(this, options);
    }	
}
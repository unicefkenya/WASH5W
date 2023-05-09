import { OptionData } from "./option-data.model";

export class Option {

	id!: number | null;
	data!: OptionData;	
	version!: number | null;

    constructor(options?: Partial<Option>) {
        Object.assign(this, options);
    }	
}
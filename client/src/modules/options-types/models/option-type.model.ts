import { OptionTypeData } from "./option-type-data.model";

export class OptionType {

	id!: number | null;
	data!: OptionTypeData;	
	version!: number | null;

    constructor(options?: Partial<OptionType>) {
        Object.assign(this, options);
    }	
}
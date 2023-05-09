import { Dissagregation } from "@common/models/dissaggregation.model";


export class DataFormFieldResponse {

    index!: number;
	fieldId!: number;
	value!: any;	
    dissagregations!: Dissagregation[];

    constructor(options?: Partial<DataFormFieldResponse>) {
        Object.assign(this, options);
    }	
}
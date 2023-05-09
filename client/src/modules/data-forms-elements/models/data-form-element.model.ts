import { DataFormElementData } from "./data-form-element-data.model";

export class DataFormElement {

	id!: number | null;
	data!: DataFormElementData;	
	version!: number | null;

    constructor(options?: Partial<DataFormElement>) {
        Object.assign(this, options);
    }	
}
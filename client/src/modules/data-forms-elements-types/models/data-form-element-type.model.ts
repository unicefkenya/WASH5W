import { DataFormElementTypeData } from "./data-form-element-type-data.model";

export class DataFormElementType {

	id!: number | null;
	data!: DataFormElementTypeData;	
	version!: number | null;

    constructor(options?: Partial<DataFormElementType>) {
        Object.assign(this, options);
    }	
}
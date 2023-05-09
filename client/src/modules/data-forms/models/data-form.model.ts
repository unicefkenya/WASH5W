import { DataFormData } from "./data-form-data.model";

export class DataForm {

	id!: number | null;
	data!: DataFormData;	
	version!: number | null;

    constructor(options?: Partial<DataForm>) {
        Object.assign(this, options);
    }	
}
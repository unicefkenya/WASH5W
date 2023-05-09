import { DataFormResponseData } from "./data-form-response-data.model";

export class DataFormResponse {

	id!: number | null;
	data!: DataFormResponseData;	
	version!: number | null;

    constructor(options?: Partial<DataFormResponse>) {
        Object.assign(this, options);
    }	
}
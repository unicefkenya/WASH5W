import { DataFormElementCategoryData } from "./data-form-element-category-data.model";

export class DataFormElementCategory {

	id!: number | null;
	data!: DataFormElementCategoryData;	
	version!: number | null;

    constructor(options?: Partial<DataFormElementCategory>) {
        Object.assign(this, options);
    }	
}
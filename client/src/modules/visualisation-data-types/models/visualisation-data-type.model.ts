import { VisualisationDataTypeData } from "./visualisation-data-type-data.model";

export class VisualisationDataType {

	id!: number | null;
	data!: VisualisationDataTypeData;	
	version!: number | null;

    constructor(options?: Partial<VisualisationDataType>) {
        Object.assign(this, options);
    }	
}
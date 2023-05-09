import { VisualisationAxisTypeData } from "./visualisation-axis-type-data.model";

export class VisualisationAxisType {

	id!: number | null;
	data!: VisualisationAxisTypeData;	
	version!: number | null;

    constructor(options?: Partial<VisualisationAxisType>) {
        Object.assign(this, options);
    }	
}
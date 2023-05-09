import { VisualisationTypeData } from "./visualisation-type-data.model";

export class VisualisationType {

	id!: number | null;
	data!: VisualisationTypeData;	
	version!: number | null;

    constructor(options?: Partial<VisualisationType>) {
        Object.assign(this, options);
    }	
}
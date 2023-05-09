import { VisualisationAxisData } from "./visualisation-axis-data.model";

export class VisualisationAxis {

	id!: number | null;
	data!: VisualisationAxisData;	
	version!: number | null;

    constructor(options?: Partial<VisualisationAxis>) {
        Object.assign(this, options);
    }	
}
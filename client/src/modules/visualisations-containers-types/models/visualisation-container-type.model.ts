import { VisualisationContainerTypeData } from "./visualisation-container-type-data.model";

export class VisualisationContainerType {

	id!: number | null;
	data!: VisualisationContainerTypeData;	
	version!: number | null;

    constructor(options?: Partial<VisualisationContainerType>) {
        Object.assign(this, options);
    }	
}
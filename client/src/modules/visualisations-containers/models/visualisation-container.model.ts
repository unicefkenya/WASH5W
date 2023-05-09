import { VisualisationContainerData } from "./visualisation-container-data.model";

export class VisualisationContainer {

	id!: number | null;
	data!: VisualisationContainerData;	
	version!: number | null;

    constructor(options?: Partial<VisualisationContainer>) {
        Object.assign(this, options);
    }	
}
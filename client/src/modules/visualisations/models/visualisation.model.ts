import { VisualisationData } from "./visualisation-data.model";

export class Visualisation {

	id!: number | null;
	data!: VisualisationData;	
	version!: number | null;

    constructor(options?: Partial<Visualisation>) {
        Object.assign(this, options);
    }	
}
import { VisualisationFormatData } from "./visualisation-format-data.model";

export class VisualisationFormat {

	id!: number | null;
	data!: VisualisationFormatData;	
	version!: number | null;

    constructor(options?: Partial<VisualisationFormat>) {
        Object.assign(this, options);
    }	
}
import { VisualisationVariableData } from "./visualisation-variable-data.model";

export class VisualisationVariable {

	id!: number | null;
	data!: VisualisationVariableData;	
	version!: number | null;

    constructor(options?: Partial<VisualisationVariable>) {
        Object.assign(this, options);
    }	
}
import { VisualisationVariableRoleData } from "./visualisation-variable-role-data.model";

export class VisualisationVariableRole {

	id!: number | null;
	data!: VisualisationVariableRoleData;	
	version!: number | null;

    constructor(options?: Partial<VisualisationVariableRole>) {
        Object.assign(this, options);
    }	
}
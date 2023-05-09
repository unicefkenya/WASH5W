import { OperatorData } from "./operator-data.model";

export class Operator {

	id!: number | null;
	data!: OperatorData;	
	version!: number | null;

    constructor(options?: Partial<Operator>) {
        Object.assign(this, options);
    }	
}
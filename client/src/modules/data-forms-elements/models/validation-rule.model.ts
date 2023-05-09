import { Operator } from "@modules/operators/models/operator.model";

export class ValidationRule {

    operatorId: number | null | undefined;
    value: any | null | undefined;
    message: string | null | undefined;

    constructor(options?: Partial<ValidationRule>) {
        Object.assign(this, options);
    }	
}
import { IndicatorAutoFillingRule } from "./indicator-auto-filling-rule.model";

export class IndicatorData {

    contextId: number | null | undefined;
    logicalParentId: number | null | undefined;
    unitId: number | null | undefined;
    no: string | null | undefined;
    name: string | null | undefined;
    subindicatorsFilled!: boolean;
    subindicatorsIds: number[] | null | undefined;
    formFilled!: boolean;
    formFieldId: number | null | undefined; 
    autoFillingRule: IndicatorAutoFillingRule | null | undefined; 
    cumulative!: boolean; // The entered value is cumulative
    
    constructor(options?: Partial<IndicatorData>) {
        Object.assign(this, options);
    }
}
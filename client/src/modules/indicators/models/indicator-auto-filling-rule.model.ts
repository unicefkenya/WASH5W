
export class IndicatorAutoFillingRule {

    aggregationId: number | null | undefined; 
    optionId: number | null | undefined;

    constructor(options?: Partial<IndicatorAutoFillingRule>) {
        Object.assign(this, options);
    }	
}
export class RelevancyRule {

    fieldId: number | null | undefined;
    operatorId: number | null | undefined;
    value: any | null | undefined;

    constructor(options?: Partial<RelevancyRule>) {
        Object.assign(this, options);
    }
}
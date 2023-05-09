export class QuantityObservationData {

    partyId: number | null | undefined;
    timePointId: number | null | undefined;
    timePeriodId: number | null | undefined;
    phenomenonTypeId: number | null | undefined;
    observationTypeId: number | null | undefined;
    unitId: number | null | undefined;
    amount: number | null | undefined;
    total: number | null | undefined;

    constructor(options?: Partial<QuantityObservationData>) {
        Object.assign(this, options);
    }
}
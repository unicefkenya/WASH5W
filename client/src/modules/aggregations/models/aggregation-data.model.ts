export class AggregationData {

    name: string | null | undefined;

    constructor(options?: Partial<AggregationData>) {
        Object.assign(this, options);
    }
}
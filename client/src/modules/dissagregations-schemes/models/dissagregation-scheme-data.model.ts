export class DissagregationSchemeData {

    name: string | null | undefined;

    constructor(options?: Partial<DissagregationSchemeData>) {
        Object.assign(this, options);
    }
}
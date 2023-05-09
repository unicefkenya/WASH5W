export class OperatorData {

    name: string | null | undefined;
    constraint: string | null | undefined;
    condition: string | null | undefined;

    constructor(options?: Partial<OperatorData>) {
        Object.assign(this, options);
    }
}
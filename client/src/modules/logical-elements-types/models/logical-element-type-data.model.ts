export class LogicalElementTypeData {

    name: string | null | undefined;
    plural: string | null | undefined;

    constructor(options?: Partial<LogicalElementTypeData>) {
        Object.assign(this, options);
    }
}
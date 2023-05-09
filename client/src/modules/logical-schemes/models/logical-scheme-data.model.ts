export class LogicalSchemeData {

    name: string | null | undefined;

    constructor(options?: Partial<LogicalSchemeData>) {
        Object.assign(this, options);
    }
}
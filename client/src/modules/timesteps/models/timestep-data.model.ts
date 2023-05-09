export class TimestepData {

    name: string | null | undefined;

    constructor(options?: Partial<TimestepData>) {
        Object.assign(this, options);
    }
}
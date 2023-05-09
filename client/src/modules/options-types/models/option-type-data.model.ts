export class OptionTypeData {

    name: string | null | undefined;

    constructor(options?: Partial<OptionTypeData>) {
        Object.assign(this, options);
    }
}
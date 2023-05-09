export class ScopeTypeData {

    name: string | null | undefined;
    active: boolean | null | undefined;

    constructor(options?: Partial<ScopeTypeData>) {
        Object.assign(this, options);
    }
}
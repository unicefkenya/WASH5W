export class ContextData {

    name: string | null | undefined;
    abbreviation: string | null | undefined;
    description: string | null | undefined;
    schemeId: number | null | undefined;
    timestep: {id: number | null | undefined; name: string | null | undefined} | null | undefined;

    constructor(options?: Partial<ContextData>) {
        Object.assign(this, options);
    }
}
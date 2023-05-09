export class PartyTypeData {

    name: string | null | undefined;
    active: boolean | null | undefined;

    constructor(options?: Partial<PartyTypeData>) {
        Object.assign(this, options);
    }
}
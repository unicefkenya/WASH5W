export class UnitData {

    name: string | null | undefined;
    abbreviation: string | null | undefined;

    constructor(options?: Partial<UnitData>) {
        Object.assign(this, options);
    }
}
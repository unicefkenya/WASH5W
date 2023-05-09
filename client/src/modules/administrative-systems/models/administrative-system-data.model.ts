export class AdministrativeSystemData {

    name: string | null | undefined;

    constructor(options?: Partial<AdministrativeSystemData>) {
        Object.assign(this, options);
    }
}
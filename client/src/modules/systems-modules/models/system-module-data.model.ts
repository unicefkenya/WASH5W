export class SystemModuleData {

    name: string | null | undefined;
    enabled: boolean | null | undefined;
    customisable: boolean | null | undefined;

    constructor(options?: Partial<SystemModuleData>) {
        Object.assign(this, options);
    }
}
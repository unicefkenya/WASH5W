export class DomainData {

    name: string | null | undefined;

    constructor(options?: Partial<DomainData>) {
        Object.assign(this, options);
    }
}
export class SystemRoleData {

    code: string | null | undefined;
    name: string | null | undefined;
    description: string | null | undefined;
    permissions?: string[] | null | undefined;
    homeId: number | null | undefined;
    customisable: boolean | null | undefined;


    constructor(options?: Partial<SystemRoleData>) {
        Object.assign(this, options);
    }
}
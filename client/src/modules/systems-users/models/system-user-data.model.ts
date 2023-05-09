import { SystemRole } from "@modules/systems-roles/models/system-role.model";
import { SystemUserRight } from "@modules/systems-users-rights/models";

export class SystemUserData {

    name: string | null | undefined;
    email: string | null | undefined;
    password?: string | null | undefined;
    enabled: boolean | null | undefined;
    confirmed: boolean | null | undefined;
    rights?: SystemUserRight[] | null | undefined;

    constructor(options?: Partial<SystemUserData>) {
        Object.assign(this, options);
    }
}
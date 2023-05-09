import { SystemUserRight } from "@modules/systems-users-rights/models/system-user-right.model";

export class Claims {

    iss?: string | null | undefined;
    iat?: number | null | undefined;
    exp?: number | null | undefined;
    sub: string | null | undefined;
    uid: number | null | undefined;
    name: string | null | undefined;
    email: string | null | undefined;
    confirmed: boolean | null | undefined;
    enabled: boolean | null | undefined;
    rights: SystemUserRight[] | null | undefined;

    constructor(options?: Partial<Claims>) {
        Object.assign(this, options);
    }
}
export class PasswordRecoveryEmail {

    to: string | null | undefined;
    token: string | null | undefined;

    constructor(options?: Partial<PasswordRecoveryEmail>) {
        Object.assign(this, options);
    }
}
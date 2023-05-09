export class RegistrationConfirmationEmail {

    to: string | null | undefined;
    token: string | null | undefined;

    constructor(options?: Partial<RegistrationConfirmationEmail>) {
        Object.assign(this, options);
    }
}
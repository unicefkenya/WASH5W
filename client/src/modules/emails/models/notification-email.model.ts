export class NotificationEmail {

    to: string | null | undefined;
    subject: string | null | undefined;
    message: string | null | undefined;

    constructor(options?: Partial<NotificationEmail>) {
        Object.assign(this, options);
    }
}
export class EmailDispatchInfo {

    messageId: string | null | undefined;
    message: string | null | undefined;

    constructor(options?: Partial<EmailDispatchInfo>) {
        Object.assign(this, options);
    }
}
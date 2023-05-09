export class EncodedToken {

    token!: string;

    constructor(options?: Partial<EncodedToken>) {
        Object.assign(this, options);
    }
}
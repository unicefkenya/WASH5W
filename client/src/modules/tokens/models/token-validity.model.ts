export class TokenValidity {

    valid!: boolean;

    constructor(options?: Partial<TokenValidity>) {
        Object.assign(this, options);
    }
}
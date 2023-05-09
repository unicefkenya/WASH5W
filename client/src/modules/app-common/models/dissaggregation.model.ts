
export class Dissagregation {

    scheme!: string;
	parameter!: string;
    value!: number

    constructor(options?: Partial<Dissagregation>) {
        Object.assign(this, options);
    }	
}
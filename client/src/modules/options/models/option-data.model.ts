export class OptionData {

	typeId: number | null | undefined;
    name: string | null | undefined;

    constructor(options?: Partial<OptionData>) {
        Object.assign(this, options);
    }	
}
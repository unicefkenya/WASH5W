export class DataFormData {

	contextId: number | null | undefined;
    name: string | null | undefined;	
    workflow: {id: number | null | undefined; name: string | null | undefined;} | null | undefined;	
    description: string | null | undefined;	

    constructor(options?: Partial<DataFormData>) {
        Object.assign(this, options);
    }	
}
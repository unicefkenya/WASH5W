export class VisualisationContainerData {

	contextId: number | null | undefined;
	typeId: number | null | undefined;    
    parentId: number | null | undefined;
    navTitle: string | null | undefined;
    pageTitle: string | null | undefined;

    constructor(options?: Partial<VisualisationContainerData>) {
        Object.assign(this, options);
    }	
}
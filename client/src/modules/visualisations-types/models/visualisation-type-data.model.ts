export class VisualisationTypeData {

    parentId: number | null | undefined;
    name: string | null | undefined;

    constructor(options?: Partial<VisualisationTypeData>) {
        Object.assign(this, options);
    }
}
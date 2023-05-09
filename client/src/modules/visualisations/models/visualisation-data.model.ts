export class VisualisationData {

    visualisationContainerId: number | null | undefined;
    visualisationTypeId: number | null | undefined;
    visualisationDataTypeId: number | null | undefined;
    name: string | null | undefined;    

    entityTypeId: number | null | undefined;


    constructor(options?: Partial<VisualisationData>) {
        Object.assign(this, options);
    }
}

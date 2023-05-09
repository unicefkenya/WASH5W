export class VisualisationAxisData {

	visualisationId: number | null | undefined;
    axisId: number | null | undefined;
    label: string | null | undefined;

    constructor(options?: Partial<VisualisationAxisData>) {
        Object.assign(this, options);
    }	
}
export class VisualisationVariableData {

    visualisationId: number | null | undefined;
    indicatorId: number | null | undefined;
    roleId: number | null | undefined;
    labelIdx: number | null | undefined;
    label: string | null | undefined;
    dimensionIdx: number | null | undefined;
    dimension: string | null | undefined;
    color: string | null | undefined;

    constructor(options?: Partial<VisualisationVariableData>) {
        Object.assign(this, options);
    }
}
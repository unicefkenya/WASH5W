export class VisualisationFormatData {

    name: string | null | undefined;

    constructor(options?: Partial<VisualisationFormatData>) {
        Object.assign(this, options);
    }
}
export class TimePeriodData {

    "contextId": number | null | undefined;
    "typeId": number | null | undefined;
    "start": string | null | undefined;
    "end": string | null | undefined;
    "open": boolean | null | undefined;

    constructor(options?: Partial<TimePeriodData>) {
        Object.assign(this, options);
    }
}
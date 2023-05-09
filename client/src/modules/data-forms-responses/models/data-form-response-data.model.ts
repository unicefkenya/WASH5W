import { DataFormFieldResponse } from "@modules/data-forms-elements/models/data-form-field-response.model";

export class DataFormResponseData {

    contextId: number | null | undefined;
    timePeriodId: number | null | undefined;
    timePointId: number | null | undefined;
    formId: number | null | undefined;
    location: {id: number | null | undefined; name: string | null | undefined;}[] | null | undefined;
    organisations: {id: number | null | undefined; roleId: number | null | undefined; name: string | null | undefined;}[] | null | undefined;
    entity: {id: number | null | undefined; name: string | null | undefined;} | null | undefined;
    respondent: {id: number | null | undefined; name: string | null | undefined; email: string | null | undefined;} | null | undefined;
    responses: DataFormFieldResponse[] | null | undefined;
    status: {id: number | null | undefined; name: string | null | undefined;} | null | undefined;
    ongoing: boolean = true;

    constructor(options?: Partial<DataFormResponseData>) {
        Object.assign(this, options);
    }
}
import { State } from "@common/models/state.model";

export interface DataFormResponseState extends State {

    timePeriodId: number | null | undefined;
    formId: number | null | undefined;
    locationId: number | null | undefined;
    organisationId: number | null | undefined;
    entityId: number | null | undefined;
    respondentTypeId: number | null | undefined;
    respondentId: number | null | undefined;
    respondentName: string | null | undefined;
    statusIds: number[] | null | undefined;
}
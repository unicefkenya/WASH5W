import { State } from "@common/models/state.model";

export interface QuantityObservationState extends State{

    partiesIds: number[] | null | undefined;
    timePointId: number | null;
    timePointIdGTE: number | null;
    timePointIdLTE: number | null; 
    timePeriodId: number | null;    
    phenomenonTypesIds: number[] | null | undefined;
    observationTypeId: number | null;

}
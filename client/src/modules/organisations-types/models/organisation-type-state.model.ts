import { State } from "@common/models/state.model";

export interface OrganisationTypeState extends State {
    id: number | null | undefined;
    name: string | null | undefined;
    plural: string | null | undefined;
    abbreviation: string | null | undefined;
    colourCode: string | null | undefined; 
}
import { State } from "@common/models/state.model";

export interface AdministrativeStructureState extends State {
	hierarchyId: number | null | undefined;
    hierarchyName: string | null | undefined;
    commissionerId?: number | null | undefined;
    commissionerName?: string | null | undefined;
    responsibleId: number | null | undefined;
    responsibleName: number | null | undefined;
}
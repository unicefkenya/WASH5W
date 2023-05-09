import { State } from "@common/models/state.model";

export interface AdministrativeHierarchyState extends State {
    id: number | null | undefined;
	typesIds: number[] | null | undefined;
    commissionerId: number | null | undefined;
    commissionerName: string | null | undefined;
    responsibleId: number | null | undefined;
    responsibleName: number | null | undefined;
}
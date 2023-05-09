import { State } from "@common/models/state.model";

export interface VisualisationContainerState extends State {
  id: number | null | undefined;
	contextId: number | null | undefined;
	typesIds: number[] | null | undefined;  
  parentId: number | null | undefined;
  navTitle: string | null | undefined;
  pageTitle: string | null | undefined;
}
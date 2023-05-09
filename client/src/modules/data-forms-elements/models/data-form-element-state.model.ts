import { State } from "@common/models/state.model";

export interface DataFormElementState extends State {
  id: number | null | undefined;
  indexLTE: number | null | undefined;
  indexGTE: number | null | undefined;
  dataFormId: number | null | undefined;
  categoryId: number | null | undefined;
  typeId: number | null | undefined;
  parentId: number | null | undefined;
  name: string | null | undefined;
}

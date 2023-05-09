import { SortDirection } from "@common/directives/sortable.directive";

export interface State {
    page: number | null;
    pageSize: number | null;
    searchTerm: string | null;
    sortColumn: string | null;
    sortDirection: SortDirection | null;
}

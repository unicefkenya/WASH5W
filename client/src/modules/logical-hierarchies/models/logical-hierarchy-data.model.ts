export class LogicalHierarchyData {

    context: {id: number | null | undefined} | null | undefined;
    type: {id: number | null | undefined; name: string | null | undefined;} | null | undefined;
    commissioner: {id: number | null | undefined; name: string | null | undefined;} | null | undefined;
    responsible: {id: number | null | undefined; name: string | null | undefined;} | null | undefined;

    constructor(options?: Partial<LogicalHierarchyData>) {
        Object.assign(this, options);
    }	
}
export class WorkflowStatusData {

    name: string | null | undefined;

    constructor(options?: Partial<WorkflowStatusData>) {
        Object.assign(this, options);
    }
}
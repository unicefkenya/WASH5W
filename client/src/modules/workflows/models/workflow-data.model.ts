export class WorkflowData {

    name: string | null | undefined;

    constructor(options?: Partial<WorkflowData>) {
        Object.assign(this, options);
    }
}
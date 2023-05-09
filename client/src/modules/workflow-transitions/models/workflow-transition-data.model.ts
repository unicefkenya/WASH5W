export class WorkflowTransitionData {

    workflowId: number | null | undefined;
    from: {id: number | null | undefined;name: string | null | undefined;} | null | undefined;
    to: {id: number | null | undefined;name: string | null | undefined;} | null | undefined;
    permission: {id: number | null | undefined;name: string | null | undefined;} | null | undefined;
    verb: string | null | undefined;

    constructor(options?: Partial<WorkflowTransitionData>) {
        Object.assign(this, options);
    }

}
export class SystemTaskData {

    contextId: number | null | undefined;
    timePointId: number | null | undefined;
    taskTypeId: number | null | undefined;
    taskStatusId: number | null | undefined;
    locations?: {id: number | null | undefined; name: string | null | undefined;}[] | null | undefined;

    constructor(options?: Partial<SystemTaskData>) {
        Object.assign(this, options);
    }
}
export class DataFormElementTypeData {

    categoryId: number | null | undefined;
    name: string | null | undefined;
    icon: string | null | undefined;
    operators: number[] | null | undefined;

    constructor(options?: Partial<DataFormElementTypeData>) {
        Object.assign(this, options);
    }
}
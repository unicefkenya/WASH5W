
import { ValidationRule } from "./validation-rule.model";
import { RelevancyRule } from "./relevancy-rule.model";
import { RepeatabilityRule } from "./repeatability-rule.model";

export class DataFormElementData {

    contextId: number | null | undefined;
    dataFormId: number | null | undefined;
    categoryId: number | null | undefined;
    typeId: number | null | undefined;
    parentId: number | null | undefined;
    layoutId: number | null | undefined;
    index: number | null | undefined;
    code: string | null | undefined;
    titled: boolean | null | undefined;
    title: string | null | undefined;
    described: boolean | null | undefined;
    description: string | null | undefined;
    conditionallyRelevant: boolean | null | undefined;
    conditionalRelevancyRule: RelevancyRule | null | undefined;
    repeated: boolean | null | undefined;
    repeatabilityRule: RepeatabilityRule | null | undefined;
    validated: boolean | null | undefined;
    validationRules: ValidationRule[] | null | undefined;
    reserved: boolean | null | undefined;
    hidden: boolean | null | undefined;
    required: boolean | null | undefined;
    options: number[] | null | undefined;

    constructor(options?: Partial<DataFormElementData>) {
        Object.assign(this, options);
    }
}



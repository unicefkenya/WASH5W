
export class RepeatabilityCondition {

    constructor(options?: Partial<RepeatabilityCondition>) {
        Object.assign(this, options);
    }	
}

export class Repeatability {

	repeatable: boolean | null | undefined;
	condition: RepeatabilityCondition | null | undefined;

    constructor(options?: Partial<Repeatability>) {
        Object.assign(this, options);
    }	
}
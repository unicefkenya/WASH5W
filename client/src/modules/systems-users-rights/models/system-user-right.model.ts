import { SystemUserRightData } from "./system-user-right-data.model";

export class SystemUserRight {

	id!: number | null;
	data!: SystemUserRightData;	
	version!: number | null;

    constructor(options?: Partial<SystemUserRight>) {
        Object.assign(this, options);
    }	
}
import { SystemRoleData } from "./system-role-data.model";

export class SystemRole {

	id!: number | null;
	data!: SystemRoleData;	
	version!: number | null;

    constructor(options?: Partial<SystemRole>) {
        Object.assign(this, options);
    }	
}
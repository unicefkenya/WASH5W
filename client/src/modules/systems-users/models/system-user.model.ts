import { SystemUserData } from "./system-user-data.model";

export class SystemUser {

	id!: number | null | undefined;
	data!: SystemUserData;	
	version!: number | null;

    constructor(options?: Partial<SystemUser>) {
        Object.assign(this, options);
    }	
}
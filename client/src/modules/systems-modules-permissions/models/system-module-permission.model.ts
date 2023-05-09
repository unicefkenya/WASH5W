import { SystemModulePermissionData } from "./system-module-permission-data.model";

export class SystemModulePermission {

	id!: number | null;
	data!: SystemModulePermissionData;	
	version!: number | null;

    constructor(options?: Partial<SystemModulePermission>) {
        Object.assign(this, options);
    }	
}
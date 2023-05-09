import { SystemModuleData } from "./system-module-data.model";

export class SystemModule {

	id!: number | null;
	data!: SystemModuleData;	
	version!: number | null;

    constructor(options?: Partial<SystemModule>) {
        Object.assign(this, options);
    }	
}
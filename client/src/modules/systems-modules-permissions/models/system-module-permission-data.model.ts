export class SystemModulePermissionData {

    systemModuleId: number | null | undefined;
    code: string | null | undefined;	
    name: string | null | undefined;
    custom: boolean | null | undefined;	
    description: string | null | undefined;	

    constructor(options?: Partial<SystemModulePermissionData>) {
        Object.assign(this, options);
    }	
}
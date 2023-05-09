import { SideNavItems, SideNavSection } from '@modules/navigation/models';

export const sideNavSections: SideNavSection[] = [

    {
        text: 'CONTEXTS',
        items: [
            'contexts'
        ],
    }, 
    {
        text: 'ENTITIES',
        items: [
            'entitiesTypes',
            'entities'
        ],
    },
    {
        text: 'ORGANISATIONS',
        items: [
            'organisationsTypes',
            'organisations'
        ],
    },        
    {
        text: 'LOGIC',
        items: [
            'logicalElementsTypes', 
            'logicalElements',
            'logicalSchemes',
            'logicalStructures',
            'logicalHierarchies'
        ],
    },
    {
        text: 'INDICATORS',
        items: [         
            'indicators',
            'units'
        ],
    },
    {
        text: 'OPTIONS',
        items: [         
            'optionsTypes',
            'options'
        ],
    },         
    {
        text: 'FORMS',
        items: [
            'dataForms',
            'dataFormsDesigns',
            'dataFormsPreviews'
        ],
    },
    {
        text: 'WORKFLOWS',
        items: [
            'workflows',            
            'workflowStatuses',           
            'workflowTransitions',
        ],
    },              
    {
        text: 'LOCATIONS',
        items: [
            'administrativeUnitsTypes',
            'administrativeUnits',            
            'administrativeSystems',
            'administrativeStructures',            
            'administrativeHierarchies'
        ],
    },
    {
        text: 'REPORTING',
        items: [
            'timePeriods',
            'visualisationsContainers',
            'reports'
        ],
    },  
    {
        text: 'VISUALISATIONS',
        items: [
            'visualisationsContainers'
        ],
    },                    
    {
        text: 'SECURITY',
        items: [
            'systemModules',
            'systemModulesPermissions',            
            'systemRoles',
            'systemRolesPermissions',
            'systemUsers'
        ],
    }


];

export const reportersSideNavSections: SideNavSection[] = [
    {
        text: 'REPORTING',
        items: [
            'reports'
        ],
    }

];


export const reviewersSideNavSections: SideNavSection[] = [
    {
        text: 'REPORTING',
        items: [
            'reports'
        ],
    }

];

export const sideNavItems: SideNavItems = {

    administrativeHierarchies: {
        icon: 'cog',
        text: 'Admin Hierarchies',
        link: '/contents/administrative_hierarchies',
        
    },

    administrativeStructures: {
        icon: 'cog',
        text: 'Admin Structures',
        link: '/contents/administrative_structures',
        
    }, 

    administrativeSystems: {
        icon: 'cog',
        text: 'Admin Systems',
        link: '/contents/administrative_systems',
        
    },   

    administrativeUnits: {
        icon: 'cog',
        text: 'Admin Units',
        link: '/contents/administrative_units',
        
    },

    administrativeUnitsTypes: {
        icon: 'cog',
        text: 'Admin Units Types',
        link: '/contents/administrative_units_types',
        
    },

    contexts: {
        icon: 'cog',
        text: 'Contexts',
        link: '/contents/contexts',
        
    },

    dataForms: {
        icon: 'cog',
        text: 'Forms',
        link: '/contents/data_forms',
        
    },

    dataFormsDesigns: {
        icon: 'cog',
        text: 'Forms Designs',
        link: '/contents/data_forms_elements/designs',
        
    },  

    dataFormsPreviews: {
        icon: 'cog',
        text: 'Forms Previews',
        link: '/contents/data_forms_elements/designs_previews',
        
    }, 
    
    domains: {
        icon: 'cog',
        text: 'Domains',
        link: '/contents/domains'
    },    

    entities: {
        icon: 'cog',
        text: 'Entities',
        link: '/contents/entities',
        
    },  

    entitiesLevels: {
        icon: 'cog',
        text: 'Entities Levels',
        link: '/contents/entities_levels',
        
    }, 

    entitiesOwnerships: {
        icon: 'cog',
        text: 'Entities Ownerships',
        link: '/contents/entities_ownerships',
        
    }, 

    entitiesTypes: {
        icon: 'cog',
        text: 'Entities Types',
        link: '/contents/entities_types',
        
    },  

    indicators: {
        icon: 'cog',
        text: 'Indicators',
        link: '/contents/indicators',
        
    }, 

    logicalElementsTypes: {
        icon: 'cog',
        text: 'Elements Types',
        link: '/contents/logical_elements_types',
        
    },     

    logicalElements: {
        icon: 'cog',
        text: 'Elements',
        link: '/contents/logical_elements',
        
    }, 
    
    logicalHierarchies: {
        icon: 'cog',
        text: 'Hierarchies',
        link: '/contents/logical_hierarchies',
        
    },

    logicalSchemes: {
        icon: 'cog',
        text: 'Schemes',
        link: '/contents/logical_schemes',
        
    },
    
    logicalStructures: {
        icon: 'cog',
        text: 'Structures',
        link: '/contents/logical_structures',
        
    },     

    optionsTypes: {
        icon: 'cog',
        text: 'Options Types',
        link: '/contents/options_types',
        
    },    

    options: {
        icon: 'cog',
        text: 'Options',
        link: '/contents/options',
        
    },     
    
    organisationsTypes: {
        icon: 'cog',
        text: 'Organisations Types',
        link: '/contents/organisations_types',
        
    },     

    organisations: {
        icon: 'cog',
        text: 'Organisations',
        link: '/contents/organisations',
        
    },    

    reports: {
        icon: 'cog',
        text: 'Reports',
        link: '/contents/data_forms_responses',
        
    }, 

    systemModules: {
        icon: 'cog',
        text: 'Modules',
        link: '/contents/systems_modules',
        
    },

    systemModulesPermissions: {
        icon: 'cog',
        text: 'Modules Permissions',
        link: '/contents/systems_modules_permissions',
        
    },    

    systemRoles: {
        icon: 'cog',
        text: 'Roles',
        link: '/contents/systems_roles',
        
    },

    systemRolesPermissions: {
        icon: 'cog',
        text: 'Roles Permissions',
        link: '/contents/systems_roles_permissions',
        
    },    

    systemUsers: {
        icon: 'cog',
        text: 'Users',
        link: '/contents/systems_users',
        
    },

    timePeriods: {
        icon: 'cog',
        text: 'Reporting Periods',
        link: '/contents/time_periods',
        
    }, 
    
    units: {
        icon: 'cog',
        text: 'Indicators Units',
        link: '/contents/units',
        
    }, 

    workflows: {
        icon: 'cog',
        text: 'Workflows',
        link: '/contents/workflows',
        
    },  

    workflowStatuses: {
        icon: 'cog',
        text: 'Workflow Statuses',
        link: '/contents/workflow_statuses',
        
    },  

    workflowTransitions: {
        icon: 'cog',
        text: 'Workflow Transitions',
        link: '/contents/workflow_transitions',
        
    },
    
    visualisationsContainers: {
        icon: 'cog',
        text: 'Containers',
        link: '/contents/visualisations_containers',
        
    }      

};

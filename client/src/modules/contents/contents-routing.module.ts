/* tslint:disable: ordered-imports*/
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

/* Module */
import { ContentsModule } from './contents.module';

/* Containers */
import * as contentsContainers from './containers';

/* Guards */
import { SBRouteData } from '@modules/navigation/models';
import { AuthGuard } from '@modules/auth/guards/auth.guard';

/* Routes */
export const ROUTES: Routes = [
    {
        path: '',
        canActivate: [AuthGuard],
        component: contentsContainers.ContentsPageComponent,
        data: {
            title: 'Contents',
            breadcrumbs: [],
        } as SBRouteData,
        children: [
            {
                path: 'administrative_hierarchies',
                
                loadChildren: () =>
                    import('modules/administrative-hierarchies/administrative-hierarchies-routing.module').then(
                        m => m.AdministrativeHierarchiesRoutingModule
                    ),
                canActivate: []
            },
            {
                path: 'administrative_systems',
                
                loadChildren: () =>
                    import('modules/administrative-systems/administrative-systems-routing.module').then(
                        m => m.AdministrativeSystemsRoutingModule
                    ),
                canActivate: []
            },
            {
                path: 'administrative_structures',
                
                loadChildren: () =>
                    import('modules/administrative-structures/administrative-structures-routing.module').then(
                        m => m.AdministrativeStructuresRoutingModule
                    ),
                canActivate: []
            },            
            {
                path: 'administrative_units',
                
                loadChildren: () =>
                    import('modules/administrative-units/administrative-units-routing.module').then(
                        m => m.AdministrativeUnitsRoutingModule
                    ),
                canActivate: []
            },
            {
                path: 'administrative_units_types',
                
                loadChildren: () =>
                    import('modules/administrative-units-types/administrative-units-types-routing.module').then(
                        m => m.AdministrativeUnitsTypesRoutingModule
                    ),
                canActivate: []
            },
            {
                path: 'contexts',
                
                loadChildren: () =>
                    import('@modules/contexts/contexts-routing.module').then(
                        m => m.ContextsRoutingModule
                    ),
                canActivate: []
            },
            {
                path: 'dashboards/:contextId/:containerId',
                
                loadChildren: () =>
                    import('modules/dashboards/dashboards-routing.module').then(
                        m => m.DashboardsRoutingModule
                    ),
                canActivate: []
            },     
            {
                path: 'data_forms',
                
                loadChildren: () =>
                    import('modules/data-forms/data-forms-routing.module').then(
                        m => m.DataFormsRoutingModule
                    ),
                canActivate: []
            },
            {
                path: 'data_forms_responses',
                
                loadChildren: () =>
                    import('modules/data-forms-responses/data-forms-responses-routing.module').then(
                        m => m.DataFormsResponsesRoutingModule
                    ),
                canActivate: []
            },
            {
                path: 'domains',
                
                loadChildren: () =>
                    import('modules/domains/domains-routing.module').then(
                        m => m.DomainsRoutingModule
                    ),
                canActivate: []
            },                                                    
            {
                path: 'entities_types',
                
                loadChildren: () =>
                    import('modules/entities-types/entities-types-routing.module').then(
                        m => m.EntitiesTypesRoutingModule
                    ),
                canActivate: []
            },    
            {
                path: 'entities',
                
                loadChildren: () =>
                    import('modules/entities/entities-routing.module').then(
                        m => m.EntitiesRoutingModule
                    ),
                canActivate: []
            },                     
            {
                path: 'data_forms_elements',
                
                loadChildren: () =>
                    import('modules/data-forms-elements/data-forms-elements-routing.module').then(
                        m => m.DataFormsElementsRoutingModule
                    ),
                    canActivate: []
            },
            {
                path: 'indicators',
                
                loadChildren: () =>
                    import('modules/indicators/indicators-routing.module').then(
                        m => m.IndicatorsRoutingModule
                    ),
                canActivate: []
            }, 
            {
                path: 'logical_elements_types',
                
                loadChildren: () =>
                    import('modules/logical-elements-types/logical-elements-types-routing.module').then(
                        m => m.LogicalElementsTypesRoutingModule
                    ),
                canActivate: []
            },  
            {
                path: 'logical_elements',
                
                loadChildren: () =>
                    import('modules/logical-elements/logical-elements-routing.module').then(
                        m => m.LogicalElementsRoutingModule
                    ),
                canActivate: []
            },   
            {
                path: 'logical_hierarchies',
                
                loadChildren: () =>
                    import('modules/logical-hierarchies/logical-hierarchies-routing.module').then(
                        m => m.LogicalHierarchiesRoutingModule
                    ),
                canActivate: []
            },            
            {
                path: 'logical_schemes',
                
                loadChildren: () =>
                    import('modules/logical-schemes/logical-schemes-routing.module').then(
                        m => m.LogicalSchemesRoutingModule
                    ),
                canActivate: []
            }, 
            {
                path: 'logical_structures',
                
                loadChildren: () =>
                    import('modules/logical-structures/logical-structures-routing.module').then(
                        m => m.LogicalStructuresRoutingModule
                    ),
                canActivate: []
            },    
            {
                path: 'options_types',
                
                loadChildren: () =>
                    import('modules/options-types/options-types-routing.module').then(
                        m => m.OptionsTypesRoutingModule
                    ),
                canActivate: []
            },                                   
            {
                path: 'options',
                
                loadChildren: () =>
                    import('modules/options/options-routing.module').then(
                        m => m.OptionsRoutingModule
                    ),
                canActivate: []
            },
            {
                path: 'organisations_types',
                
                loadChildren: () =>
                    import('modules/organisations-types/organisations-types-routing.module').then(
                        m => m.OrganisationsTypesRoutingModule
                    ),
                canActivate: []
            },  
            {
                path: 'organisations',
                
                loadChildren: () =>
                    import('modules/organisations/organisations-routing.module').then(
                        m => m.OrganisationsRoutingModule
                    ),
                canActivate: []
            },                       
            {
                path: 'systems_modules',
                
                loadChildren: () =>
                    import('modules/systems-modules/systems-modules-routing.module').then(
                        m => m.SystemsModulesRoutingModule
                    ),
                canActivate: []
            },
            {
                path: 'systems_modules_permissions',
                
                loadChildren: () =>
                    import('modules/systems-modules-permissions/systems-modules-permissions-routing.module').then(
                        m => m.SystemsModulesPermissionsRoutingModule
                    ),
                canActivate: []
            },
            {
                path: 'systems_roles',
                
                loadChildren: () =>
                    import('modules/systems-roles/systems-roles-routing.module').then(
                        m => m.SystemsRolesRoutingModule
                    ),
                canActivate: []
            },
            {
                path: 'systems_roles_permissions',
                
                loadChildren: () =>
                    import('modules/systems-roles-permissions/systems-roles-permissions-routing.module').then(
                        m => m.SystemsRolesPermissionsRoutingModule
                    ),
                canActivate: []
            },
            {
                path: 'systems_users',
                
                loadChildren: () =>
                    import('modules/systems-users/systems-users-routing.module').then(
                        m => m.SystemsUsersRoutingModule
                    ),
                canActivate: []
            },            
            {
                path: 'time_periods',
                
                loadChildren: () =>
                    import('modules/time-periods/time-periods-routing.module').then(
                        m => m.TimePeriodsRoutingModule
                    ),
                canActivate: []
            },  
            {
                path: 'units',
                
                loadChildren: () =>
                    import('modules/units/units-routing.module').then(
                        m => m.UnitsRoutingModule
                    ),
                canActivate: []
            }, 
            {
                path: 'visualisations_containers',
                
                loadChildren: () =>
                    import('modules/visualisations-containers/visualisations-containers-routing.module').then(
                        m => m.VisualisationsContainersRoutingModule
                    ),
                canActivate: []
            },                                 
            {
                path: 'workflows',
                
                loadChildren: () =>
                    import('modules/workflows/workflows-routing.module').then(
                        m => m.WorkflowsRoutingModule
                    ),
                canActivate: []
            }, 
            {
                path: 'workflow_statuses',
                
                loadChildren: () =>
                    import('modules/workflow-statuses/workflow-statuses-routing.module').then(
                        m => m.WorkflowStatusesRoutingModule
                    ),
                canActivate: []
            },     
            {
                path: 'workflow_transitions',
                
                loadChildren: () =>
                    import('modules/workflow-transitions/workflow-transitions-routing.module').then(
                        m => m.WorkflowTransitionsRoutingModule
                    ),
                canActivate: []
            },                                
        ]
    },
    {
        path: '**',
        pathMatch: 'full',
        loadChildren: () =>
            import('modules/error/error-routing.module').then(m => m.ErrorRoutingModule),
    }
];



@NgModule({
    imports: [ContentsModule, RouterModule.forChild(ROUTES)],
    exports: [RouterModule],
})
export class ContentsRoutingModule { }

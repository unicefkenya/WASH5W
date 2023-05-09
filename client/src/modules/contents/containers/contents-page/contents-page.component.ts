import {
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    HostBinding,
    Input,
    OnInit,
} from '@angular/core';
import { FilterService } from '@app/app-filter.service';
import { sideNavItems } from '@modules/navigation/data';
import { NavigationService } from '@modules/navigation/services';
import { VisualisationsContainersDataService } from '@modules/visualisations-containers/services/visualisations-containers-data.service';
import { Subscription, first, BehaviorSubject } from 'rxjs';
import { NGXLogger } from 'ngx-logger';
import { VisualisationContainer } from '@modules/visualisations-containers/models/visualisation-container.model';
import { SideNavItem, SideNavItems, SideNavSection } from '@modules/navigation/models/navigation.model';
import { ContextsDataService } from '@modules/contexts/services/contexts-data.service';
import { Context } from '@modules/contexts/models/context.model';
import { Router } from '@angular/router';
import { SystemUserRight } from '@modules/systems-users-rights/models';
import { SystemRole } from '@modules/systems-roles/models';
import { SystemsModulesPermissionsDataService } from '@modules/systems-modules-permissions/services/systems-modules-permissions-data.service';
import { SystemsRolesDataService } from '@modules/systems-roles/services/systems-roles-data.service';
import { AuthService } from '@modules/auth/services/auth.service';

const LOG_PREFIX: string = "[Contents Page]";

export interface Menu {
    sections: SideNavSection[] | null;
    sideNavItems: SideNavItems | null;
}

@Component({
    selector: 'sb-contents-page',
    changeDetection: ChangeDetectionStrategy.OnPush,
    templateUrl: './contents-page.component.html',
    styleUrls: ['contents-page.component.scss'],
})
export class ContentsPageComponent implements OnInit {

    @Input() static = false;
    @Input() light = false;
    @HostBinding('class.sb-sidenav-toggled') sideNavHidden = false;

    // Keep a local reference of the currently active context
    private activeContext: Context | null | undefined = null;


    subscription: Subscription = new Subscription();

    private sideNavItemsSubject$ = new BehaviorSubject<SideNavItems>({});
    readonly sideNavItems$ = this.sideNavItemsSubject$.asObservable();

    private sideNavSectionsSubject$ = new BehaviorSubject<SideNavSection[]>([]);
    readonly sideNavSections$ = this.sideNavSectionsSubject$.asObservable();


    // Keep tabs on whether the component has been fully initialised
    initialised: boolean = false;

    // Central gathering point for all the component's subscriptions.
    // Makes it efficient to unsubscribe from all subscriptions when the component is destroyed.   
    private _subscriptions: Subscription[] = [];

    constructor(
        public contextsDataService: ContextsDataService,
        public visualisationsContainersDataService: VisualisationsContainersDataService,
        public systemsModulesPermissionsDataService: SystemsModulesPermissionsDataService,
        public systemsRolesDataService: SystemsRolesDataService,
        public navigationService: NavigationService,
        public filterService: FilterService,
        private authService: AuthService,
        private router: Router,
        private cd: ChangeDetectorRef,
        private log: NGXLogger
    ) { }

    ngOnInit() {

        this.subscription.add(
            this.navigationService.sideNavVisible$().subscribe(isVisible => {
                this.sideNavHidden = !isVisible;
                this.cd.detectChanges();
            })
        );

        this.initialiseActiveContextChangesHandler(() => {

            this.initialised = true;
            this.cd.detectChanges();

        })

    }

    ngOnDestroy() {
        this.subscription.unsubscribe();
    }


    /**
     * Subscribe and react to Context changes
     * @param callback The function to call when done
     */
    private initialiseActiveContextChangesHandler(callback: () => void): void {

        this.log.trace(`${LOG_PREFIX} Entering initialiseActiveContextChangesHandler()`);

        // Subscribe to filtering criteria updates and react to them if the Context is changed
        this.log.trace(`${LOG_PREFIX} Subscribing to filtering criteria updates and reacting to them if the Context is changed`);
        this._subscriptions.push(
            this.filterService.currentFilter$
                .subscribe({
                    next: (filter) => {

                        if ((JSON.stringify(this.activeContext) !== JSON.stringify(filter.activeContext))) {

                            // Active context changed
                            this.log.trace(`${LOG_PREFIX} Active context changed`);

                            // Keep a local reference to the location / temporal filters
                            this.activeContext = filter.activeContext;

                            // Retrieve the context's page / page group containers
                            this.initialiseVisualisationContainers(filter.activeContext, (visualisationContainers: VisualisationContainer[] | null) => {

                                // Check if the page / page group containers were successfully retrieved
                                if (visualisationContainers) {

                                    // The page / page group containers were successfully retrieved

                                    // Initialise the dashboard menu
                                    this.initialiseDashboardMenu(visualisationContainers, (dashboardMenu: Menu) => {

                                        // Initialise the other menu
                                        this.initialiseOtherMenu((otherMenu: Menu) => {

                                            // Collate the side nav items
                                            let items: SideNavItems = {};

                                            if (items && dashboardMenu.sideNavItems) {
                                                items = Object.assign(items, dashboardMenu.sideNavItems);
                                            }

                                            if (items && otherMenu.sideNavItems) {
                                                items = Object.assign(items, otherMenu.sideNavItems);
                                            }

                                            // Collate the sections
                                            let sections: SideNavSection[] = [];

                                            if (sections && dashboardMenu.sections) {
                                                sections = [...sections, ...dashboardMenu.sections]
                                            }

                                            if (sections && otherMenu.sections) {
                                                sections = [...sections, ...otherMenu.sections]
                                            }


                                            // Update the sections / items containers
                                            this.sideNavItemsSubject$.next(items);
                                            this.sideNavSectionsSubject$.next(sections);

                                        });

                                    })

                                } else {

                                    // The page / page group containers were not successfully retrieved

                                }
                            });
                        }
                    }
                })
        );

        // Transfer control to the callback function
        callback();

    }






    /**
     * Retrieves and returns Page / Page Groups Visualisation Containers records
     * @param callback The function to call when done
     */
    private initialiseVisualisationContainers(context: Context | null | undefined, callback: (visualisationContainers: VisualisationContainer[] | null) => void): void {

        this.log.trace(`${LOG_PREFIX} Entering initialiseVisualisationContainers()`);

        // Check if the context has been defined
        this.log.trace(`${LOG_PREFIX} Checking if the context has been defined`);
        if (context) {

            // The context has been defined
            this.log.trace(`${LOG_PREFIX} The context has been defined`);

            // Retrieve and cache all the VisualisationContainers records
            this.log.trace(`${LOG_PREFIX} Retrieving and caching all the VisualisationContainers records`);
            this.visualisationsContainersDataService
                .getVisualisationsContainers(false, {
                    page: null,
                    pageSize: null,
                    searchTerm: null,
                    sortColumn: 'id',
                    sortDirection: 'asc',
                    id: null,
                    contextId: context.id,
                    typesIds: [Number(1), Number(2)], // Page Groups / Pages
                    parentId: null,
                    navTitle: null,
                    pageTitle: null
                })
                .pipe(first()) // This will automatically complete (and therefore unsubscribe) after the first value has been emitted.
                .subscribe({
                    next: (visualisationContainers: VisualisationContainer[]) => {

                        // VisualisationContainers successfully retrieved and cached
                        this.log.debug(`${LOG_PREFIX} ${visualisationContainers.length} VisualisationContainer(s) retrieved and cached`);

                        // Return
                        this.log.trace(`${LOG_PREFIX} Returning`);
                        callback(visualisationContainers);
                    },

                    error: (err: any) => {

                        // Visualisations Containers retrieval failed
                        this.log.error(`${LOG_PREFIX} Visualisations Containers retrieval failed`);

                        // Return
                        this.log.trace(`${LOG_PREFIX} Returning`);
                        callback(null);
                    }
                });

        } else {


            // The context has not been defined
            this.log.error(`${LOG_PREFIX} The context has not been defined`);

            // Return
            this.log.trace(`${LOG_PREFIX} Returning`);
            callback(null);

        }



    }



    /**
     * Initialise menus
     * @param context the currently active context
     * @param callback the function to call once done
     */
    private initialiseDashboardMenu(containers: VisualisationContainer[], callback: (dashboardMenu: Menu) => void) {

        this.log.trace(`${LOG_PREFIX} Entering initialiseDashboardMenu()`);

        if (containers.length > 0) {

            // Dashboard container(s) were successfully retrieved
            this.log.debug(`${LOG_PREFIX} Dashboard container(s) = ${JSON.stringify(containers)}`);

            // Convert the page / page group containers to side nav items
            this.log.trace(`${LOG_PREFIX} Converting the page / page group containers to side nav items list`);
            const sideNavItemsList: SideNavItem[] = this.convertContainersToSideNavItems(containers);
            this.log.debug(`${LOG_PREFIX} Side Nav Items List = ${JSON.stringify(sideNavItemsList)}`);

            // Convert the side nav items list to a side nav items tree list 
            this.log.trace(`${LOG_PREFIX} Converting the page / page group containers to side nav items tree list`);
            const sideNavItemsTreeList: SideNavItem[] = this.convertSideNavItemsToTreeList(sideNavItemsList);
            this.log.debug(`${LOG_PREFIX} Side Nav Items Tree List = ${JSON.stringify(sideNavItemsTreeList)}`);

            // Use the side nav items tree list to create dashboard section / items linked by a dynamically generated key
            this.log.trace(`${LOG_PREFIX} Using the side nav items tree list to create dashboard section / items`);
            const section: SideNavSection = { text: "Dashboards", items: [] }
            const items: SideNavItems = {};
            for (let sideNavItem of this.convertSideNavItemsToTreeList(this.convertContainersToSideNavItems(containers))) {
                const key: string = (sideNavItem.text.replace(/\s/g, "").toLowerCase()) + this.generateRandomNumber(1, 1000);
                section.items.push(key);
                items[key] = sideNavItem;
            }

            // Instantiate the dashboard menu using the dynamically created section / items
            this.log.trace(`${LOG_PREFIX} Instantiating the dashboard menu using the dynamically created section / items`);
            const menu: Menu = { sections: [section], sideNavItems: items }
            this.log.debug(`${LOG_PREFIX} Menu = ${JSON.stringify(menu)}`);

            // Return
            callback(menu);

        } else {

            // No dashboard container was successfully retrieved
            this.log.trace(`${LOG_PREFIX} No dashboard container was successfully retrieved`);

            // Set dashboard sections and nav items to null and return
            this.log.trace(`${LOG_PREFIX} Setting the dashboard sections and nav items to null and returning`);
            callback({
                sections: null,
                sideNavItems: null
            })
        }

    }



    private initialiseOtherMenu(callback: (otherMenu: Menu) => void) {

        this.log.trace(`${LOG_PREFIX} Entering initialiseOtherMenu()`);

        // Check if the active user system role was successfully retrieved
        this.log.trace(`${LOG_PREFIX} Checking if the active user system role was successfully retrieved`);
        if (this.filterService.filter.activeSystemUserContextSystemRole) {

            // The active user system role was successfully retrieved
            this.log.trace(`${LOG_PREFIX} The active user system role was successfully retrieved`);

            // Check if the active user system role permissions were included
            this.log.trace(`${LOG_PREFIX} Checking if the active user system role permissions were included`);
            if (this.filterService.filter.activeSystemUserContextSystemRole.data.permissions) {

                // The active user system role permissions were included
                this.log.trace(`${LOG_PREFIX} The active user system role permissions were included`);

                let sections: string[] = [
                    "CONTEXTS",
                    "ENTITIES",
                    "ORGANISATIONS",
                    /*"LOGIC",*/
                    "INDICATORS",
                    "OPTIONS",
                    "FORMS",
                    "WORKFLOWS",
                    "LOCATIONS",
                    "SECURITY",
                    "REPORTING",
                    "VISUALISATIONS"
                ];

                const sideNavSections: SideNavSection[] = [];

                for (let section of sections) {
                    const items: string[] = this.getSideNavSectionItems(section, this.filterService.filter.activeSystemUserContextSystemRole.data.permissions);
                    if (items.length >= 1) {
                        sideNavSections.push({
                            text: section,
                            items: items
                        })
                    }
                }

                callback({
                    sections: sideNavSections,
                    sideNavItems: sideNavItems
                })

            } else {


                // The system active user role permissions were not included
                this.log.error(`${LOG_PREFIX} The active user system role permissions were not included`);

                // Set the non-dashboard sections / items to null and return
                this.log.warn(`${LOG_PREFIX} Setting the non-dashboard sections / items to null and returning`);
                callback({
                    sections: null,
                    sideNavItems: null
                })
            }

        } else {

            // The active user system role was not successfully retrieved
            this.log.error(`${LOG_PREFIX} The active user system role was not successfully retrieved`);

            // Set the non-dashboard sections / items to null and return
            this.log.warn(`${LOG_PREFIX} Setting the non-dashboard sections / items to null and returning`);
            callback({
                sections: null,
                sideNavItems: null
            })
        }

    }


    /**
     * Retrieves all the navigation items that the user is permitted to view in a certain navigation section
     * @param section the parent navigation section
     * @param permissions the permissions that have been granted to the user courtesy of their assigned role
     * @returns the sections nav item
     */
    private getSideNavSectionItems(section: string, permissions: string[]): string[] {

        const items: string[] = [];

        switch (section.toUpperCase()) {

            case "CONTEXTS":

                if (permissions.some(p => p == "canViewContexts")) {
                    items.push("contexts");
                }

                break;

            case "ENTITIES":

                if (permissions.some(p => p == "canViewEntitiesTypes")) {
                    items.push("entitiesTypes");
                }

                if (permissions.some(p => p == "canViewEntities")) {
                    items.push("entities");
                }

                break;

            case "ORGANISATIONS":

                if (permissions.some(p => p == "canViewOrganisationsTypes")) {
                    items.push("organisationsTypes");
                }

                if (permissions.some(p => p == "canViewOrganisations")) {
                    items.push("organisations");
                }

                break;

            case "LOGIC":

                if (permissions.some(p => p == "canViewLogicalElementsTypes")) {
                    items.push("logicalElementsTypes");
                }

                if (permissions.some(p => p == "canViewLogicalElements")) {
                    items.push("logicalElements");
                }

                if (permissions.some(p => p == "canViewLogicalSchemes")) {
                    items.push("logicalSchemes");
                }

                if (permissions.some(p => p == "canViewLogicalStructures")) {
                    items.push("logicalStructures");
                }

                if (permissions.some(p => p == "canViewLogicalHierarchies")) {
                    items.push("logicalHierarchies");
                }

                break;

            case "INDICATORS":

                if (permissions.some(p => p == "canViewIndicators")) {
                    items.push("indicators");
                }

                if (permissions.some(p => p == "canViewIndicatorsUnits")) {
                    items.push("units");
                }

                break;

            case "OPTIONS":

                if (permissions.some(p => p == "canViewOptionsTypes")) {
                    items.push("optionsTypes");
                }

                if (permissions.some(p => p == "canViewOptions")) {
                    items.push("options");
                }

                break;

            case "FORMS":

                if (permissions.some(p => p == "canViewDataForms")) {
                    items.push("dataForms");
                }

                if (permissions.some(p => p == "canViewDataFormsDesign")) {
                    items.push("dataFormsDesigns");
                }

                if (permissions.some(p => p == "canViewDataFormsPreviews")) {
                    items.push("dataFormsPreviews");
                }

                break;

            case "WORKFLOWS":

                if (permissions.some(p => p == "canViewWorkflows")) {
                    items.push("workflows");
                }

                if (permissions.some(p => p == "canViewWorkflowStatuses")) {
                    items.push("workflowStatuses");
                }

                if (permissions.some(p => p == "canViewWorkflowTransitions")) {
                    items.push("workflowTransitions");
                }

                break;

            case "LOCATIONS":

                if (permissions.some(p => p == "canViewAdministrativeUnitsTypes")) {
                    items.push("administrativeUnitsTypes");
                }

                if (permissions.some(p => p == "canViewAdministrativeUnits")) {
                    items.push("administrativeUnits");
                }

                if (permissions.some(p => p == "canViewAdministrativeSystems")) {
                    items.push("administrativeSystems");
                }

                if (permissions.some(p => p == "canViewAdministrativeStructures")) {
                    items.push("administrativeStructures");
                }

                if (permissions.some(p => p == "canViewAdministrativeHierarchies")) {
                    items.push("administrativeHierarchies");
                }

                break;

            case "REPORTING":

                if (permissions.some(p => p == "canViewReportingPeriods")) {
                    items.push("timePeriods");
                }

                if (permissions.some(p => p == "canViewReports")) {
                    items.push("reports");
                }           

                break;

            case "VISUALISATIONS":

                if (permissions.some(p => p == "canViewVisualisationsContainers")) {
                    items.push("visualisationsContainers");
                }

                break;

            case "SECURITY":

                if (permissions.some(p => p == "canViewSystemsModules")) {
                    items.push("systemModules");
                }

                if (permissions.some(p => p == "canViewSystemsModulesPermissions")) {
                    items.push("systemModulesPermissions");
                }

                if (permissions.some(p => p == "canViewSystemsRoles")) {
                    items.push("systemRoles");
                }

                if (permissions.some(p => p == "canViewSystemsRolesPermissions")) {
                    items.push("systemRolesPermissions");
                }

                if (permissions.some(p => p == "canViewSystemsUsers")) {
                    items.push("systemUsers");
                }

                break;


        }

        return items;
    }

    /**
     * Retrieves the active user's call in the currently active context and returns it as a callback argument
     */
    private retrieveContextRole(callback: (systemRole: SystemRole | null) => void) {

        this.log.trace(`${LOG_PREFIX} Entering retrieveContextRole()`);


        // Check if the active user has been initialised
        this.log.error(`${LOG_PREFIX} Checking if the active user has been initialised`);
        if (this.filterService.filter.activeSystemUser?.data.rights) {

            // The active user has been initialised
            this.log.error(`${LOG_PREFIX} The active user has been initialised`);

            // Check if the active context has been initialised
            this.log.error(`${LOG_PREFIX} Checking if the active context has been initialised`);
            if (this.filterService.filter.activeContext?.id) {

                // The active context has been initialised
                this.log.error(`${LOG_PREFIX} The active context has been initialised`);

                // Try retrieving the user's right in the active context
                this.log.error(`${LOG_PREFIX} Trying to retrieve the user's right in the active context`);
                const right: SystemUserRight | undefined = this.filterService.filter.activeSystemUser.data.rights.find(r => r.data.context?.id == this.filterService.filter.activeContext?.id);

                // Check if the user's right was successfully retrieved
                this.log.error(`${LOG_PREFIX} Checking if the user's right was successfully retrieved`);
                if (right) {

                    // The user's right was successfully retrieved
                    this.log.error(`${LOG_PREFIX} The user's right was successfully retrieved`);

                    // Check if the user's role was correctly identified within the right
                    this.log.error(`${LOG_PREFIX} Checking if the user's role was correctly identified within the right`);
                    if (right.data.role?.id) {

                        // The user's role was correctly identified within the right
                        this.log.error(`${LOG_PREFIX} The user's role was correctly identified within the right`);

                        // Try retrieving the details of the identified user role
                        this.log.error(`${LOG_PREFIX} Trying to retrieve the details of the identified user role`);
                        this.systemsRolesDataService
                            .getSystemsRoles(false, {
                                searchTerm: null,
                                page: null,
                                pageSize: null,
                                sortColumn: null,
                                sortDirection: null,
                                ids: [right.data.role.id],
                                code: null,
                                name: null,
                            })
                            .pipe(first()) // This will automatically complete (and therefore unsubscribe) after the first value has been emitted.
                            .subscribe({
                                next: (systemRoles: SystemRole[]) => {

                                    // Check if the identified system role was successfully retrieved
                                    this.log.trace(`${LOG_PREFIX} Checking if the identified system role was successfully retrieved`);
                                    if (systemRoles.length == 1) {

                                        // The identified system role was successfully retrieved
                                        this.log.trace(`${LOG_PREFIX} The identified system role was successfully retrieved`);

                                        // Return the system role
                                        this.log.trace(`${LOG_PREFIX} Returning ${JSON.stringify(systemRoles[0])}`);
                                        callback(systemRoles[0]);

                                    } else {

                                        // The identified system role was not successfully retrieved
                                        this.log.error(`${LOG_PREFIX} ${systemRoles.length > 1 ? "The identified system role could not be uniquely retrieved" : "The identified system role could not be successfully retrieved"} `);

                                        // Return null in place of system role
                                        this.log.warn(`${LOG_PREFIX} Returning null in place of system role`);
                                        callback(null);

                                    }
                                },

                                error: (err: any) => {

                                    // The logged in user's rights could not be successfully retrieved
                                    this.log.error(`${LOG_PREFIX} The logged in user's rights could not be successfully retrieved`);

                                    // Return null in place of system role
                                    this.log.warn(`${LOG_PREFIX} Returning null in place of system role`);
                                    callback(null);


                                }
                            });

                    } else {

                        // The user's role was not correctly identified within the right
                        this.log.error(`${LOG_PREFIX} The user's role was not correctly identified within the right`);

                        // Return null in place of system role
                        this.log.warn(`${LOG_PREFIX} Returning null in place of system role`);
                        callback(null);


                    }

                } else {

                    // The user's right was not successfully retrieved
                    this.log.error(`${LOG_PREFIX} The user's right was not successfully retrieved`);

                    // Return null in place of system role
                    this.log.warn(`${LOG_PREFIX} Returning null in place of system role`);
                    callback(null);
                }

            } else {

                // The active user has not been initialised
                this.log.error(`${LOG_PREFIX} The active user has not been initialised`);

                // Return null in place of system role
                this.log.warn(`${LOG_PREFIX} Returning null in place of system role`);
                callback(null);

            }






        }

    }


    private convertContainersToSideNavItems(containers: VisualisationContainer[]): SideNavItem[] {

        const output: SideNavItem[] = [];

        for (let container of containers) {

            if (container.id && container.data.navTitle) {

                switch (container.data.typeId) {

                    case 1: // Page Group

                        output.push({
                            id: container.id,
                            parentId: container.data.parentId ? container.data.parentId as number : null,
                            icon: "cog",
                            text: container.data.navTitle,
                            submenu: []
                        });

                        break;

                    case 2: // Page

                        output.push({
                            id: container.id,
                            parentId: container.data.parentId ? container.data.parentId as number : null,
                            icon: "cog",
                            text: container.data.navTitle,
                            link: `/contents/dashboards/${this.filterService.filter.activeContext?.id}/${container.id}`
                        });

                        break;

                }

            }
        }

        return output;
    }

    private convertSideNavItemsToTreeList(sideNavItems: SideNavItem[]): SideNavItem[] {

        const map: Map<number, SideNavItem> = new Map();

        for (let sideNavItem of sideNavItems) {
            if (sideNavItem.id) {
                map.set(sideNavItem.id, sideNavItem);
            }
        }

        const output: SideNavItem[] = [];

        for (const sideNavItem of sideNavItems) {

            if (sideNavItem.parentId && map.has(sideNavItem.parentId)) {

                map.get(sideNavItem.parentId)?.submenu?.push(sideNavItem);

            } else {

                output.push(sideNavItem);

            }

        };

        return output;
    }

    /**
    
    * Generate random int
    * See: https://infinitbility.com/how-to-get-random-number-in-typescript/
    * @param min 
    * @param max 
    * @returns random int - min & max inclusive
    */

    private generateRandomNumber(_min: number, _max: number): number {

        const min: number = Math.ceil(_min);

        const max: number = Math.floor(_max);

        return Math.floor(Math.random() * (max - min + 1)) + min;

    }


}


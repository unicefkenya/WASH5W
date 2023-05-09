import { Injectable } from '@angular/core';
import { Router, CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, ActivatedRoute } from '@angular/router';
import { FilterService } from '@app/app-filter.service';
import { Context } from '@modules/contexts/models/context.model';
import { ContextsDataService } from '@modules/contexts/services/contexts-data.service';
import { NGXLogger } from 'ngx-logger';
import { first, timer } from 'rxjs';

const LOG_PREFIX: string = "[Auth Guard]";

@Injectable({ providedIn: 'root' })
export class AuthGuard implements CanActivate {

    constructor(
        public contextsDataService: ContextsDataService,
        public filterService: FilterService,
        private log: NGXLogger,
        private router: Router) {

    }

    canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {

        this.log.trace(`${LOG_PREFIX} Entering canActivate()`);

        // Check if the user is logged in
        this.log.trace(`${LOG_PREFIX} Checking if the user is logged in`);
        if (this.filterService.filter.activeSystemUser) {

            // The user is logged in
            this.log.trace(`${LOG_PREFIX} The user is logged in`);
            return true;
        } else {

            // The user is not logged in
            this.log.trace(`${LOG_PREFIX} The user is not logged in`);

            // Redirect the user to the login page
            this.log.trace(`${LOG_PREFIX} Redirecting the user to the login page`);
            this.router.navigate(['/auth/login'], { queryParams: { returnUrl: state.url ? state.url : null } });
            return false;

            /*this.autologin(state.url);
            return true;*/
        }


    }


    private autologin(returnUrl: string): void {
        this.filterService.update({
            activeSystemUser: {
                id: Math.random(),
                data: {
                    email: "admin@miles.co.ke",
                    name: "Administrator",
                    enabled: true,
                    confirmed: true,
                    rights: []
                },
                version: 1
            }
        });

        this.initialiseContexts(() => {
            this.initialiseActiveContext(() => {
                
            })
        })

        this.router.navigateByUrl(returnUrl);


    }


    public showSystemErrorPage(): void {

        // Show the system error page
        this.log.trace(`${LOG_PREFIX} Showing the system error page`);
        this.router.navigate(['/error/500']);

    }


    /**
     * Retrieves and caches Contexts records
     * @param callback The function to call when done
     */
    private initialiseContexts(callback: () => void): void {

        this.log.trace(`${LOG_PREFIX} Entering initialiseContexts()`);

            // Retrieve and cache all the Contexts records
            this.log.trace(`${LOG_PREFIX} Retrieving and caching all the Contexts records`);
            this.contextsDataService
                .getContexts(false, {
                    searchTerm: null,
                    page: null,
                    pageSize: null,
                    sortColumn: 'id',
                    sortDirection: 'asc',
                    ids: null,
                    abbreviation: null,
                    name: null
                })
                .pipe(first()) // This will automatically complete (and therefore unsubscribe) after the first value has been emitted.
                .subscribe({
                    next: (contexts: Context[]) => {

                        // Contexts successfully retrieved and cached
                        this.log.debug(`${LOG_PREFIX} ${contexts.length} Context(s) retrieved and cached`);

                        if (contexts.length >= 1) {

                            // Update the global filter
                            this.log.trace(`${LOG_PREFIX} Updating the global filter`);
                            this.filterService.update({ assignedContexts: contexts });


                            // Return
                            this.log.trace(`${LOG_PREFIX} Returning`);
                            callback();

                        } else {

                            // Show the system error page
                            this.showSystemErrorPage();

                        }
                    },

                    error: (err: any) => {

                        // Contexts retrieval failed
                        this.log.error(`${LOG_PREFIX} Contexts retrieval failed`);

                        // Return
                        this.log.trace(`${LOG_PREFIX} Returning`);
                        callback();
                    }
                });


    }


    /**
     * Sets the active Context if it has not been set in the global filter
     * @param callback The function to call when done
     */
    private initialiseActiveContext(callback: () => void): void {

        this.log.trace(`${LOG_PREFIX} Entering initialiseActiveContext()`);

        // Check if the active Context has been set in the global filter
        this.log.trace(`${LOG_PREFIX} Checking if the active Context has been set in the global filter`);
        if (this.filterService.filter.activeContext) {

            // The active Context has been set in the global filter
            this.log.trace(`${LOG_PREFIX} The active Context has been set in the global filter`);

            // Check if the active Context record exists in the cache
            this.log.trace(`${LOG_PREFIX} Checking if the active Context record exists in the cache`);
            if (this.filterService.filter.assignedContexts.some(a => a.id == this.filterService.filter.activeContext?.id)) {

                // The active Context record exists in the cache
                this.log.trace(`${LOG_PREFIX} The active Context record exists in the cache`);

                // Initialisation is valid
                this.log.trace(`${LOG_PREFIX} Initialisation is valid`);

            } else {

                // Initialisation is invalid
                this.log.trace(`${LOG_PREFIX} Initialisation is invalid`);

                // Get the first Context record
                this.log.trace(`${LOG_PREFIX} Get the first Context record`);
                const context: Context | null = this.filterService.filter.assignedContexts.length > 0 ? this.filterService.filter.assignedContexts[0] : null;
                this.log.trace(`${LOG_PREFIX} First Context record = ${JSON.stringify(context)}`);

                // Update the global filter
                this.log.trace(`${LOG_PREFIX} Updating the global filter`);
                this.filterService.update({ activeContext: context });

            }

            // Return
            this.log.trace(`${LOG_PREFIX} Returning`);
            callback();

        } else {

            // The active Context has not been set in the global filter
            this.log.trace(`${LOG_PREFIX} The active Context has not been set in the global filter`);

            // Get the first Context record
            this.log.trace(`${LOG_PREFIX} Get the first Context record`);
            const context: Context | null = this.filterService.filter.assignedContexts.length > 0 ? this.filterService.filter.assignedContexts[0] : null;
            this.log.trace(`${LOG_PREFIX} First Context record = ${JSON.stringify(context)}`);

            // Update the global filter
            this.log.trace(`${LOG_PREFIX} Updating the global filter`);
            this.filterService.update({ activeContext: context });

            // Return
            this.log.trace(`${LOG_PREFIX} Returning`);
            callback();

        }
    }

}
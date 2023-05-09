import { LayoutAuthComponent } from './layout-auth/layout-auth.component';
import { LayoutDashboardComponent } from './layout-dashboard/layout-dashboard.component';
import { LayoutErrorComponent } from './layout-error/layout-error.component';
import { LayoutHomeComponent } from './layout-home/layout-home.component';
import { LayoutMainComponent } from './layout-main/layout-main.component';
import { LayoutReportingComponent } from './layout-reporting/layout-reporting.component';

export const layouts = [
    LayoutAuthComponent,
    LayoutDashboardComponent,  
    LayoutErrorComponent, 
    LayoutHomeComponent, 
    LayoutMainComponent,
    LayoutReportingComponent];


export * from './layout-auth/layout-auth.component';
export * from './layout-dashboard/layout-dashboard.component';
export * from './layout-error/layout-error.component';
export * from './layout-home/layout-home.component';
export * from './layout-main/layout-main.component';
export * from './layout-reporting/layout-reporting.component';

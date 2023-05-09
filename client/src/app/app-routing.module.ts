import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from '@modules/auth/guards/auth.guard';

const routes: Routes = [
    {
        path: '',
        pathMatch: 'full',
        redirectTo: '/home',
    }, 
    {
        path: 'auth',
        loadChildren: () =>
            import('modules/auth/auth-routing.module').then(m => m.AuthRoutingModule),
    },      
    {
        path: 'contents',
        loadChildren: () =>
            import('modules/contents/contents-routing.module').then(
                m => m.ContentsRoutingModule
            ),
            canActivate: [AuthGuard]
    },                         
    {
        path: 'error',
        loadChildren: () =>
            import('modules/error/error-routing.module').then(m => m.ErrorRoutingModule),
            canActivate: []
    },                              
    {
        path: 'home',
        loadChildren: () =>
            import('modules/home/home-routing.module').then(
                m => m.HomeRoutingModule
            ),
    },                       
    {
        path: '**',
        pathMatch: 'full',
        loadChildren: () =>
            import('modules/error/error-routing.module').then(m => m.ErrorRoutingModule),
    },
];


@NgModule({
    imports: [RouterModule.forRoot(routes, { relativeLinkResolution: 'legacy', scrollPositionRestoration: 'top', useHash: true, onSameUrlNavigation: 'reload' })],
    exports: [RouterModule],
})
export class AppRoutingModule {}

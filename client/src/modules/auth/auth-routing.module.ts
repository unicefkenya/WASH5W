/* tslint:disable: ordered-imports*/
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { SBRouteData } from '@modules/navigation/models';

/* Module */
import { AuthModule } from './auth.module';

/* Containers */
import * as authContainers from './containers';

/* Guards */
import * as authGuards from './guards';

/* Routes */
export const ROUTES: Routes = [
    {
        path: '',
        pathMatch: 'full',
        redirectTo: 'login',
    },
    {
        path: 'registration',
        canActivate: [],
        component: authContainers.RegistrationPageComponent,
        data: {
            title: 'Registrater',
        } as SBRouteData,
    },
    {
        path: 'confirmation/:token',
        canActivate: [],
        component: authContainers.RegistrationConfirmationPageComponent,
        data: {
            title: 'Confirmation Registration',
        } as SBRouteData,
    },
    {
        path: 'recovery/:token',
        canActivate: [],
        component: authContainers.PasswordResetPageComponent,
        data: {
            title: 'Reset Password',
        } as SBRouteData,
    },
    {
        path: 'login',
        canActivate: [],
        component: authContainers.LoginPageComponent,
        data: {
            title: 'Login',
        } as SBRouteData,
    },
    {
        path: 'forgot-password',
        canActivate: [],
        component: authContainers.PasswordRecoveryRequestPageComponent,
        data: {
            title: 'Reset Password Request',
        } as SBRouteData,
    },
];

@NgModule({
    imports: [AuthModule, RouterModule.forChild(ROUTES)],
    exports: [RouterModule],
})
export class AuthRoutingModule { }

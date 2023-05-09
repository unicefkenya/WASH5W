import { PasswordRecoveryRequestPageComponent } from './password-recovery-request-page/password-recovery-request-page.component';
import { LoginPageComponent } from './login-page/login-page.component';
import { RegistrationConfirmationPageComponent } from './registration-confirmation-page/registration-confirmation-page.component';
import { RegistrationPageComponent } from './registration-page/registration-page.component';
import { PasswordResetPageComponent } from './password-reset-page/password-reset-page.component';

export const containers = [
    LoginPageComponent, 
    RegistrationPageComponent, 
    RegistrationConfirmationPageComponent, 
    PasswordRecoveryRequestPageComponent, 
    PasswordResetPageComponent];

export * from './login-page/login-page.component';
export * from './registration-page/registration-page.component';
export * from './registration-confirmation-page/registration-confirmation-page.component';
export * from './password-recovery-request-page/password-recovery-request-page.component';
export * from './password-reset-page/password-reset-page.component';


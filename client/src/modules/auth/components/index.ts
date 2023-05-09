import { LoginComponent } from "./login/login.component";
import { PasswordRecoveryRequestComponent } from "./password-recovery-request/password-recovery-request.component";
import { PasswordResetComponent } from "./password-reset/password-reset.component";
import { RegistrationConfirmationComponent } from "./registration-confirmation/registration-confirmation.component";
import { RegistrationComponent } from "./registration/registration.component";

export const components = [
    RegistrationComponent, 
    RegistrationConfirmationComponent, 
    LoginComponent, 
    PasswordRecoveryRequestComponent,
    PasswordResetComponent
];


export * from "./login/login.component";
export * from "./password-recovery-request/password-recovery-request.component";
export * from "./password-reset/password-reset.component";
export * from "./registration-confirmation/registration-confirmation.component";
export * from "./registration/registration.component";
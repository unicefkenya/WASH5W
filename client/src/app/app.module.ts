import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { NgbModalConfig, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { LoggerModule, NgxLoggerLevel } from "ngx-logger";
import { CountUpModule } from 'ngx-countup';
import { NgxPermissionsModule } from 'ngx-permissions';



import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';

@NgModule({
    declarations: [AppComponent],
    imports: [
        FormsModule,
        BrowserModule, 
        AppRoutingModule, 
        CountUpModule, 
        HttpClientModule, 
        ReactiveFormsModule, 
        NgxPermissionsModule.forRoot(),
        LoggerModule.forRoot({serverLoggingUrl: '/api/logs', level: NgxLoggerLevel.TRACE, serverLogLevel: NgxLoggerLevel.OFF})],
    providers: [
        NgbModalConfig, 
        NgbModal],
    bootstrap: [AppComponent]
})
export class AppModule {}

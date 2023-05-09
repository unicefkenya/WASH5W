import { TestBed } from '@angular/core/testing';
import { HttpTestingController, HttpClientTestingModule } from '@angular/common/http/testing';
import { SystemsModulesDataService } from './systems-modules-data.service';
import { LoggerModule, NgxLoggerLevel } from 'ngx-logger';
import { EmailService } from '../../app-common/services/emails.service';
import { ConnectivityStatusService } from '@common/services';

describe('SystemsModules Data Service', () => {

    let systemsModulesDataService: SystemsModulesDataService;
    let httpMock: HttpTestingController;

    beforeEach(() => {

        TestBed.configureTestingModule({
            imports: [HttpClientTestingModule, LoggerModule.forRoot({ serverLoggingUrl: '/api/logs', level: NgxLoggerLevel.TRACE, serverLogLevel: NgxLoggerLevel.OFF })],
            providers: [SystemsModulesDataService, EmailService, ConnectivityStatusService],
        });

    
        systemsModulesDataService = TestBed.inject(SystemsModulesDataService);
        httpMock = TestBed.inject(HttpTestingController);

    });

});

function expectNone() {
    throw new Error('Function not implemented.');
}


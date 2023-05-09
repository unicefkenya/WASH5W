import { TestBed } from '@angular/core/testing';
import { HttpTestingController, HttpClientTestingModule } from '@angular/common/http/testing';
import { AdministrativeUnitsDataService } from './administrative-units-data.service';
import { LoggerModule, NgxLoggerLevel } from 'ngx-logger';
import { EmailService } from '../../app-common/services/emails.service';
import { ConnectivityStatusService } from '@common/services';

describe('DataF orms Data Service', () => {

    let administrativeUnitsDataService: AdministrativeUnitsDataService;
    let httpMock: HttpTestingController;

    beforeEach(() => {

        TestBed.configureTestingModule({
            imports: [HttpClientTestingModule, LoggerModule.forRoot({ serverLoggingUrl: '/api/logs', level: NgxLoggerLevel.TRACE, serverLogLevel: NgxLoggerLevel.OFF })],
            providers: [AdministrativeUnitsDataService, EmailService, ConnectivityStatusService],
        });

    
        administrativeUnitsDataService = TestBed.inject(AdministrativeUnitsDataService);
        httpMock = TestBed.inject(HttpTestingController);

    });

});

function expectNone() {
    throw new Error('Function not implemented.');
}


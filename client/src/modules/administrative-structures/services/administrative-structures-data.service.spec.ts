import { TestBed } from '@angular/core/testing';
import { HttpTestingController, HttpClientTestingModule } from '@angular/common/http/testing';
import { AdministrativeStructuresDataService } from './administrative-structures-data.service';
import { LoggerModule, NgxLoggerLevel } from 'ngx-logger';
import { EmailService } from '../../app-common/services/emails.service';
import { ConnectivityStatusService } from '@common/services';

describe('Administrative Structures Data Service', () => {

    let administrativeStructuresDataService: AdministrativeStructuresDataService;
    let httpMock: HttpTestingController;

    beforeEach(() => {

        TestBed.configureTestingModule({
            imports: [HttpClientTestingModule, LoggerModule.forRoot({ serverLoggingUrl: '/api/logs', level: NgxLoggerLevel.TRACE, serverLogLevel: NgxLoggerLevel.OFF })],
            providers: [AdministrativeStructuresDataService, EmailService, ConnectivityStatusService],
        });

    
        administrativeStructuresDataService = TestBed.inject(AdministrativeStructuresDataService);
        httpMock = TestBed.inject(HttpTestingController);

    });

});

function expectNone() {
    throw new Error('Function not implemented.');
}


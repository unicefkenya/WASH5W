import { TestBed } from '@angular/core/testing';
import { HttpTestingController, HttpClientTestingModule } from '@angular/common/http/testing';
import { OrganisationsTypesDataService } from './organisations-types-data.service';
import { LoggerModule, NgxLoggerLevel } from 'ngx-logger';
import { EmailService } from '../../app-common/services/emails.service';
import { ConnectivityStatusService } from '@common/services';

describe('OrganisationsTypes Data Service', () => {

    let organisationsTypesDataService: OrganisationsTypesDataService;
    let httpMock: HttpTestingController;

    beforeEach(() => {

        TestBed.configureTestingModule({
            imports: [HttpClientTestingModule, LoggerModule.forRoot({ serverLoggingUrl: '/api/logs', level: NgxLoggerLevel.TRACE, serverLogLevel: NgxLoggerLevel.OFF })],
            providers: [OrganisationsTypesDataService, EmailService, ConnectivityStatusService],
        });

    
        organisationsTypesDataService = TestBed.inject(OrganisationsTypesDataService);
        httpMock = TestBed.inject(HttpTestingController);

    });

});

function expectNone() {
    throw new Error('Function not implemented.');
}


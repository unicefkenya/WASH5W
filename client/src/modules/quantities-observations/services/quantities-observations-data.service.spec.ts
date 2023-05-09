import { TestBed } from '@angular/core/testing';
import { HttpTestingController, HttpClientTestingModule } from '@angular/common/http/testing';
import { LoggerModule, NgxLoggerLevel } from 'ngx-logger';
import { EmailService } from '../../app-common/services/emails.service';
import { ConnectivityStatusService } from '@common/services';
import { QuantitiesObservationsDataService } from './quantities-observations-data.service';

describe('Quantities Observations Data Service', () => {

    let administrativeUnitsDataService: QuantitiesObservationsDataService;
    let httpMock: HttpTestingController;

    beforeEach(() => {

        TestBed.configureTestingModule({
            imports: [HttpClientTestingModule, LoggerModule.forRoot({ serverLoggingUrl: '/api/logs', level: NgxLoggerLevel.TRACE, serverLogLevel: NgxLoggerLevel.OFF })],
            providers: [QuantitiesObservationsDataService, EmailService, ConnectivityStatusService],
        });

    
        administrativeUnitsDataService = TestBed.inject(QuantitiesObservationsDataService);
        httpMock = TestBed.inject(HttpTestingController);

    });

});

function expectNone() {
    throw new Error('Function not implemented.');
}


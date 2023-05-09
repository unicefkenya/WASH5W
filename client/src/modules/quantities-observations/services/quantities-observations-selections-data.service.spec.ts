import { TestBed } from '@angular/core/testing';
import { HttpTestingController, HttpClientTestingModule } from '@angular/common/http/testing';
import { LoggerModule, NgxLoggerLevel } from 'ngx-logger';
import { EmailService } from '../../app-common/services/emails.service';
import { ConnectivityStatusService } from '@common/services';
import { QuantitiesObservationsSelectionDataService } from './quantities-observations-selections-data.service';

describe('Quantities Observations Selection Data Service', () => {

    let administrativeUnitsDataService: QuantitiesObservationsSelectionDataService;
    let httpMock: HttpTestingController;

    beforeEach(() => {

        TestBed.configureTestingModule({
            imports: [HttpClientTestingModule, LoggerModule.forRoot({ serverLoggingUrl: '/api/logs', level: NgxLoggerLevel.TRACE, serverLogLevel: NgxLoggerLevel.OFF })],
            providers: [QuantitiesObservationsSelectionDataService, EmailService, ConnectivityStatusService],
        });

    
        administrativeUnitsDataService = TestBed.inject(QuantitiesObservationsSelectionDataService);
        httpMock = TestBed.inject(HttpTestingController);

    });

});

function expectNone() {
    throw new Error('Function not implemented.');
}


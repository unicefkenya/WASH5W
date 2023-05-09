import { TestBed } from '@angular/core/testing';
import { HttpTestingController, HttpClientTestingModule } from '@angular/common/http/testing';
import { PartiesTypesDataService } from './parties-types-data.service';
import { LoggerModule, NgxLoggerLevel } from 'ngx-logger';
import { ConnectivityStatusService } from '@common/services';

describe('Parties Types Data Service', () => {

    let partiesTypesDataService: PartiesTypesDataService;
    let httpMock: HttpTestingController;

    beforeEach(() => {

        TestBed.configureTestingModule({
            imports: [HttpClientTestingModule, LoggerModule.forRoot({ serverLoggingUrl: '/api/logs', level: NgxLoggerLevel.TRACE, serverLogLevel: NgxLoggerLevel.OFF })],
            providers: [PartiesTypesDataService, ConnectivityStatusService],
        });

    
        partiesTypesDataService = TestBed.inject(PartiesTypesDataService);
        httpMock = TestBed.inject(HttpTestingController);

    });

});

function expectNone() {
    throw new Error('Function not implemented.');
}


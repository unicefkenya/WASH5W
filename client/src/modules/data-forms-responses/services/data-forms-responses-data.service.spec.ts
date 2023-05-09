import { TestBed } from '@angular/core/testing';
import { HttpTestingController, HttpClientTestingModule } from '@angular/common/http/testing';
import { DataFormsResponsesDataService } from './data-forms-responses-data.service';
import { LoggerModule, NgxLoggerLevel } from 'ngx-logger';
import { ConnectivityStatusService } from '@common/services';

describe('DataFormsResponses Data Service', () => {

    let dataFormsResponsesDataService: DataFormsResponsesDataService;
    let httpMock: HttpTestingController;

    beforeEach(() => {

        TestBed.configureTestingModule({
            imports: [HttpClientTestingModule, LoggerModule.forRoot({ serverLoggingUrl: '/api/logs', level: NgxLoggerLevel.TRACE, serverLogLevel: NgxLoggerLevel.OFF })],
            providers: [DataFormsResponsesDataService, ConnectivityStatusService],
        });

    
        dataFormsResponsesDataService = TestBed.inject(DataFormsResponsesDataService);
        httpMock = TestBed.inject(HttpTestingController);

    });

});

function expectNone() {
    throw new Error('Function not implemented.');
}


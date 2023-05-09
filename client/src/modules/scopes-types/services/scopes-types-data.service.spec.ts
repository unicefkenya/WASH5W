import { TestBed } from '@angular/core/testing';
import { HttpTestingController, HttpClientTestingModule } from '@angular/common/http/testing';
import { LoggerModule, NgxLoggerLevel } from 'ngx-logger';
import { ConnectivityStatusService } from '@common/services';
import { ScopesTypesDataService } from './scopes-types-data.service';

describe('Scopes Types Data Service', () => {

    let scopesTypesDataService: ScopesTypesDataService;
    let httpMock: HttpTestingController;

    beforeEach(() => {

        TestBed.configureTestingModule({
            imports: [HttpClientTestingModule, LoggerModule.forRoot({ serverLoggingUrl: '/api/logs', level: NgxLoggerLevel.TRACE, serverLogLevel: NgxLoggerLevel.OFF })],
            providers: [ScopesTypesDataService, ConnectivityStatusService],
        });

    
        scopesTypesDataService = TestBed.inject(ScopesTypesDataService);
        httpMock = TestBed.inject(HttpTestingController);

    });

});

function expectNone() {
    throw new Error('Function not implemented.');
}

